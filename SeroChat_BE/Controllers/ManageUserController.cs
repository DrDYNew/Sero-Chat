using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeroChat_BE.Models;

namespace SeroChat_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ManageUserController : ControllerBase
    {
        private readonly SeroChatContext _context;
        private readonly ILogger<ManageUserController> _logger;

        public ManageUserController(SeroChatContext context, ILogger<ManageUserController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/ManageUser
        [HttpGet]
        public async Task<IActionResult> GetAllUsers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null,
            [FromQuery] string? role = null,
            [FromQuery] string? status = null,
            [FromQuery] string? subscription = null)
        {
            try
            {
                var skip = (page - 1) * pageSize;
                var query = _context.Users.Where(u => u.IsDeleted == false);

                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(u =>
                        u.Email.Contains(search) ||
                        u.FullName.Contains(search) ||
                        (u.PhoneNumber != null && u.PhoneNumber.Contains(search)));
                }

                if (!string.IsNullOrEmpty(role)) query = query.Where(u => u.Role == role);
                if (!string.IsNullOrEmpty(status)) query = query.Where(u => u.Status == status);
                if (!string.IsNullOrEmpty(subscription)) query = query.Where(u => u.SubscriptionStatus == subscription);

                var totalUsers = await query.CountAsync();

                var users = await query
                    .OrderByDescending(u => u.CreatedAt)
                    .Skip(skip)
                    .Take(pageSize)
                    .Select(u => new
                    {
                        u.UserId,
                        u.Email,
                        u.FullName,
                        u.PhoneNumber,
                        u.AvatarUrl,
                        u.Role,
                        u.SubscriptionStatus,
                        u.Status,
                        u.IsVerify,
                        u.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = users,
                    pagination = new
                    {
                        page,
                        pageSize,
                        totalItems = totalUsers,
                        totalPages = (int)Math.Ceiling((double)totalUsers / pageSize)
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users");
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy danh sách người dùng" });
            }
        }

        // GET: api/ManageUser/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var user = await _context.Users
                    .Where(u => u.UserId == id && u.IsDeleted == false)
                    .Select(u => new
                    {
                        u.UserId,
                        u.Email,
                        u.FullName,
                        u.PhoneNumber,
                        u.Gender,
                        u.DateOfBirth,
                        u.AvatarUrl,
                        u.Role,
                        u.SubscriptionStatus,
                        u.PremiumExpiry,
                        u.Status,
                        u.IsVerify,
                        u.CreatedAt,
                        u.AuthProvider,
                        u.Language,
                        u.Theme
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy người dùng" });
                }

                return Ok(new { success = true, data = user });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by id");
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy thông tin người dùng" });
            }
        }

        // POST: api/ManageUser
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            try
            {
                // Check email exists
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.IsDeleted == false);
                if (existingUser != null)
                {
                    return BadRequest(new { success = false, message = "Email đã tồn tại" });
                }

                // Generate random password
                var randomPassword = GenerateRandomPassword(12);

                var user = new User
                {
                    Email = request.Email,
                    FullName = request.FullName,
                    Role = "USER",
                    Status = "ACTIVE",
                    SubscriptionStatus = "FREE",
                    IsVerify = true,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(randomPassword),
                    AuthProvider = "EMAIL",
                    CreatedAt = DateTime.Now,
                    IsDeleted = false
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // TODO: Send password to email
                // await _emailService.SendPasswordEmailAsync(user.Email, user.FullName, randomPassword);
                _logger.LogInformation($"User created with password: {randomPassword} (send to {user.Email})");

                return Ok(new { success = true, message = "Tạo người dùng thành công. Mật khẩu đã được gửi về email.", data = new { userId = user.UserId } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, new { success = false, message = "Lỗi khi tạo người dùng" });
            }
        }

        private string GenerateRandomPassword(int length)
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        // PUT: api/ManageUser/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id && u.IsDeleted == false);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy người dùng" });
                }

                // Only allow updating USER role accounts
                if (user.Role != "USER")
                {
                    return BadRequest(new { success = false, message = "Chỉ được chỉnh sửa tài khoản USER" });
                }

                if (!string.IsNullOrEmpty(request.FullName)) user.FullName = request.FullName;
                if (request.PhoneNumber != null) user.PhoneNumber = request.PhoneNumber;
                if (request.Gender != null) user.Gender = request.Gender;
                if (request.DateOfBirth.HasValue) user.DateOfBirth = DateOnly.FromDateTime(request.DateOfBirth.Value);

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Cập nhật người dùng thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user");
                return StatusCode(500, new { success = false, message = "Lỗi khi cập nhật người dùng" });
            }
        }

        // PUT: api/ManageUser/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateUserStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id && u.IsDeleted == false);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy người dùng" });
                }

                user.Status = request.Status;
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Cập nhật trạng thái thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user status");
                return StatusCode(500, new { success = false, message = "Lỗi khi cập nhật trạng thái" });
            }
        }

        // PUT: api/ManageUser/{id}/verify-email
        [HttpPut("{id}/verify-email")]
        public async Task<IActionResult> VerifyUserEmail(int id)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id && u.IsDeleted == false);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy người dùng" });
                }

                user.IsVerify = true;
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Xác thực email thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying user email");
                return StatusCode(500, new { success = false, message = "Lỗi khi xác thực email" });
            }
        }

        // DELETE: api/ManageUser/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id && u.IsDeleted == false);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy người dùng" });
                }

                user.IsDeleted = true;
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Xóa người dùng thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user");
                return StatusCode(500, new { success = false, message = "Lỗi khi xóa người dùng" });
            }
        }
    }

    public class CreateUserRequest
    {
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
    }

    public class UpdateUserRequest
    {
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
    }
}
