using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeroChat_BE.Models;
using SeroChat_BE.Interfaces;

namespace SeroChat_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly SeroChatContext _context;
        private readonly ILogger<ProfileController> _logger;
        private readonly ICloudinaryService _cloudinaryService;

        public ProfileController(SeroChatContext context, ILogger<ProfileController> logger, ICloudinaryService cloudinaryService)
        {
            _context = context;
            _logger = logger;
            _cloudinaryService = cloudinaryService;
        }

        /// <summary>
        /// Lấy thống kê của user (conversations, saved blogs, mood logs, affirmations)
        /// </summary>
        [HttpGet("stats/{userId}")]
        public async Task<IActionResult> GetUserStats(int userId)
        {
            try
            {
                // Kiểm tra user có tồn tại không
                var userExists = await _context.Users
                    .AnyAsync(u => u.UserId == userId && u.IsDeleted == false);

                if (!userExists)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy người dùng"
                    });
                }

                // Đếm số conversations
                var conversationsCount = await _context.Conversations
                    .CountAsync(c => c.UserId == userId);

                // Đếm số saved blogs
                var savedBlogsCount = await _context.SavedBlogs
                    .CountAsync(sb => sb.UserId == userId);

                // Đếm số mood logs
                var moodLogsCount = await _context.MoodLogs
                    .CountAsync(ml => ml.UserId == userId);

                // Đếm số daily affirmations (giả sử user có thể xem/lưu affirmations)
                var affirmationsCount = await _context.DailyAffirmations
                    .CountAsync();

                var stats = new
                {
                    conversations = conversationsCount,
                    savedBlogs = savedBlogsCount,
                    moodLogs = moodLogsCount,
                    affirmations = affirmationsCount
                };

                return Ok(new
                {
                    success = true,
                    message = "Lấy thống kê thành công",
                    data = stats
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user stats for userId: {UserId}", userId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi lấy thống kê"
                });
            }
        }

        /// <summary>
        /// Lấy thông tin profile của user
        /// </summary>
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetProfile(int userId)
        {
            try
            {
                var user = await _context.Users
                    .Where(u => u.UserId == userId && u.IsDeleted == false)
                    .Select(u => new
                    {
                        userId = u.UserId,
                        email = u.Email,
                        fullName = u.FullName,
                        phoneNumber = u.PhoneNumber,
                        gender = u.Gender,
                        dateOfBirth = u.DateOfBirth,
                        avatarUrl = u.AvatarUrl,
                        role = u.Role,
                        subscriptionStatus = u.SubscriptionStatus,
                        premiumExpiry = u.PremiumExpiry,
                        createdAt = u.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy người dùng"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Lấy thông tin thành công",
                    data = user
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting profile for userId: {UserId}", userId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi lấy thông tin"
                });
            }
        }

        /// <summary>
        /// Cập nhật thông tin profile
        /// </summary>
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateProfile(int userId, [FromBody] UpdateProfileRequest request)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.UserId == userId && u.IsDeleted == false);

                if (user == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy người dùng"
                    });
                }

                // Cập nhật thông tin
                if (!string.IsNullOrEmpty(request.FullName))
                    user.FullName = request.FullName;

                if (!string.IsNullOrEmpty(request.PhoneNumber))
                    user.PhoneNumber = request.PhoneNumber;

                if (!string.IsNullOrEmpty(request.Gender))
                    user.Gender = request.Gender;

                if (!string.IsNullOrEmpty(request.DateOfBirth))
                {
                    if (DateOnly.TryParse(request.DateOfBirth, out var dateOfBirth))
                    {
                        user.DateOfBirth = dateOfBirth;
                    }
                }

                if (!string.IsNullOrEmpty(request.AvatarUrl))
                    user.AvatarUrl = request.AvatarUrl;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Cập nhật thông tin thành công",
                    data = new
                    {
                        userId = user.UserId,
                        email = user.Email,
                        fullName = user.FullName,
                        phoneNumber = user.PhoneNumber,
                        gender = user.Gender,
                        dateOfBirth = user.DateOfBirth?.ToString("yyyy-MM-dd"),
                        avatarUrl = user.AvatarUrl
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating profile for userId: {UserId}", userId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi cập nhật thông tin"
                });
            }
        }

        /// <summary>
        /// Đổi mật khẩu
        /// </summary>
        [HttpPost("{userId}/change-password")]
        public async Task<IActionResult> ChangePassword(int userId, [FromBody] ChangePasswordRequest request)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.UserId == userId && u.IsDeleted == false);

                if (user == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy người dùng"
                    });
                }

                // Kiểm tra user có đăng nhập bằng email/password không
                if (string.IsNullOrEmpty(user.PasswordHash))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Tài khoản đăng nhập bằng Google không thể đổi mật khẩu"
                    });
                }

                // Verify old password
                if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Mật khẩu hiện tại không đúng"
                    });
                }

                // Validate new password
                if (request.NewPassword.Length < 6)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Mật khẩu mới phải có ít nhất 6 ký tự"
                    });
                }

                // Hash new password
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Đổi mật khẩu thành công"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for userId: {UserId}", userId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi đổi mật khẩu"
                });
            }
        }

        /// <summary>
        /// Upload avatar của user
        /// </summary>
        [HttpPost("{userId}/upload-avatar")]
        public async Task<IActionResult> UploadAvatar(int userId, IFormFile file)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.UserId == userId && u.IsDeleted == false);

                if (user == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy người dùng"
                    });
                }

                // Upload ảnh lên Cloudinary
                var avatarUrl = await _cloudinaryService.UploadImageAsync(file, "serochat/avatars");

                // Cập nhật avatar URL vào database
                user.AvatarUrl = avatarUrl;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Upload avatar thành công",
                    data = new
                    {
                        avatarUrl = avatarUrl
                    }
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading avatar for userId: {UserId}", userId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi upload avatar"
                });
            }
        }
    }

    public class UpdateProfileRequest
    {
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Gender { get; set; }
        public string? DateOfBirth { get; set; }
        public string? AvatarUrl { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string OldPassword { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }
}
