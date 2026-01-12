using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeroChat_BE.Models;

namespace SeroChat_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly SeroChatContext _context;
        private readonly ILogger<AdminController> _logger;

        public AdminController(SeroChatContext context, ILogger<AdminController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Admin/dashboard/stats
        [HttpGet("dashboard/stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                // Tổng số users
                var totalUsers = await _context.Users
                    .Where(u => u.IsDeleted == false)
                    .CountAsync();

                // Users mới trong tháng
                var firstDayOfMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                var newUsersThisMonth = await _context.Users
                    .Where(u => u.IsDeleted == false && u.CreatedAt >= firstDayOfMonth)
                    .CountAsync();

                // Tổng số blogs
                var totalBlogs = await _context.Blogs
                    .Where(b => b.IsDeleted == false)
                    .CountAsync();

                // Blogs mới trong tháng
                var newBlogsThisMonth = await _context.Blogs
                    .Where(b => b.IsDeleted == false && b.CreatedAt >= firstDayOfMonth)
                    .CountAsync();

                // Tổng số doctors
                var totalDoctors = await _context.Doctors
                    .Where(d => d.IsDeleted == false && d.IsActive == true)
                    .CountAsync();

                // Doctors mới trong tháng
                var newDoctorsThisMonth = await _context.Doctors
                    .Where(d => d.IsDeleted == false && d.IsActive == true && d.CreatedAt >= firstDayOfMonth)
                    .CountAsync();

                // Crisis alerts chưa xử lý
                var unresolvedCrisis = await _context.CrisisAlertLogs
                    .Where(c => c.IsResolved == false)
                    .CountAsync();

                // Crisis alerts trong tháng
                var totalCrisisThisMonth = await _context.CrisisAlertLogs
                    .Where(c => c.AlertTime >= firstDayOfMonth)
                    .CountAsync();

                // Tổng doanh thu tháng (PAID transactions)
                var revenueThisMonth = await _context.Transactions
                    .Where(t => t.Status == "PAID" && t.CreatedAt >= firstDayOfMonth)
                    .SumAsync(t => (decimal?)t.Amount) ?? 0;

                // Tổng doanh thu tháng trước
                var firstDayOfLastMonth = firstDayOfMonth.AddMonths(-1);
                var revenueLastMonth = await _context.Transactions
                    .Where(t => t.Status == "PAID" && t.CreatedAt >= firstDayOfLastMonth && t.CreatedAt < firstDayOfMonth)
                    .SumAsync(t => (decimal?)t.Amount) ?? 0;

                // Tính % thay đổi doanh thu
                var revenueChange = revenueLastMonth > 0 
                    ? Math.Round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100, 1)
                    : 0;

                // Premium users
                var premiumUsers = await _context.Users
                    .Where(u => u.IsDeleted == false && u.SubscriptionStatus == "PREMIUM")
                    .CountAsync();

                // Premium users tháng trước
                var premiumUsersLastMonth = await _context.Transactions
                    .Where(t => t.Status == "PAID" && t.CreatedAt >= firstDayOfLastMonth && t.CreatedAt < firstDayOfMonth)
                    .Select(t => t.UserId)
                    .Distinct()
                    .CountAsync();

                // Tính % thay đổi premium users
                var premiumChange = premiumUsersLastMonth > 0
                    ? Math.Round(((decimal)(premiumUsers - premiumUsersLastMonth) / premiumUsersLastMonth) * 100, 1)
                    : 0;

                // Tính % thay đổi users
                var usersLastMonth = totalUsers - newUsersThisMonth;
                var userChangePercent = usersLastMonth > 0
                    ? Math.Round(((decimal)newUsersThisMonth / usersLastMonth) * 100, 1)
                    : 0;

                var stats = new
                {
                    totalUsers = totalUsers,
                    newUsersThisMonth = newUsersThisMonth,
                    userChangePercent = userChangePercent,
                    
                    totalBlogs = totalBlogs,
                    newBlogsThisMonth = newBlogsThisMonth,
                    
                    totalDoctors = totalDoctors,
                    newDoctorsThisMonth = newDoctorsThisMonth,
                    
                    unresolvedCrisis = unresolvedCrisis,
                    totalCrisisThisMonth = totalCrisisThisMonth,
                    crisisChange = totalCrisisThisMonth - unresolvedCrisis,
                    
                    revenueThisMonth = revenueThisMonth,
                    revenueChangePercent = revenueChange,
                    
                    premiumUsers = premiumUsers,
                    premiumChangePercent = premiumChange
                };

                return Ok(new { success = true, data = stats });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard stats");
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy thống kê dashboard" });
            }
        }

        // GET: api/Admin/recent-activities
        [HttpGet("recent-activities")]
        public async Task<IActionResult> GetRecentActivities([FromQuery] int limit = 10)
        {
            try
            {
                var activities = new List<object>();

                // Recent users (5 mới nhất)
                var recentUsers = await _context.Users
                    .Where(u => u.IsDeleted == false)
                    .OrderByDescending(u => u.CreatedAt)
                    .Take(5)
                    .Select(u => new
                    {
                        type = "user",
                        icon = "account",
                        text = $"Người dùng mới: {u.Email}",
                        time = u.CreatedAt,
                        color = "#3b82f6"
                    })
                    .ToListAsync();

                // Recent crisis alerts (5 mới nhất)
                var recentCrisis = await _context.CrisisAlertLogs
                    .Include(c => c.User)
                    .Where(c => c.IsResolved == false)
                    .OrderByDescending(c => c.AlertTime)
                    .Take(5)
                    .Select(c => new
                    {
                        type = "crisis",
                        icon = "alert-circle",
                        text = $"Cảnh báo khủng hoảng từ {c.User.Email}",
                        time = c.AlertTime,
                        color = "#ef4444"
                    })
                    .ToListAsync();

                // Recent blogs (3 mới nhất)
                var recentBlogs = await _context.Blogs
                    .Where(b => b.IsDeleted == false)
                    .OrderByDescending(b => b.CreatedAt)
                    .Take(3)
                    .Select(b => new
                    {
                        type = "blog",
                        icon = "post",
                        text = $"Blog mới được tạo: \"{b.Title}\"",
                        time = b.CreatedAt,
                        color = "#8b5cf6"
                    })
                    .ToListAsync();

                // Recent transactions (3 mới nhất)
                var recentTransactions = await _context.Transactions
                    .Where(t => t.Status == "PAID")
                    .OrderByDescending(t => t.CreatedAt)
                    .Take(3)
                    .Select(t => new
                    {
                        type = "transaction",
                        icon = "cash",
                        text = $"Thanh toán Premium thành công - {t.Amount:N0} VNĐ",
                        time = t.CreatedAt,
                        color = "#10b981"
                    })
                    .ToListAsync();

                // Merge tất cả activities
                activities.AddRange(recentUsers.Cast<object>());
                activities.AddRange(recentCrisis.Cast<object>());
                activities.AddRange(recentBlogs.Cast<object>());
                activities.AddRange(recentTransactions.Cast<object>());

                // Sắp xếp theo thời gian và lấy limit
                var sortedActivities = activities
                    .OrderByDescending(a =>
                    {
                        var type = a.GetType();
                        var timeProp = type.GetProperty("time");
                        return (DateTime)(timeProp?.GetValue(a) ?? DateTime.MinValue);
                    })
                    .Take(limit)
                    .ToList();

                return Ok(new { success = true, data = sortedActivities });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent activities");
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy hoạt động gần đây" });
            }
        }

        // GET: api/Admin/users
        [HttpGet("users")]
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

                // Search filter
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(u => 
                        u.Email.Contains(search) || 
                        u.FullName.Contains(search) ||
                        (u.PhoneNumber != null && u.PhoneNumber.Contains(search)));
                }

                // Role filter
                if (!string.IsNullOrEmpty(role))
                {
                    query = query.Where(u => u.Role == role);
                }

                // Status filter
                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(u => u.Status == status);
                }

                // Subscription filter
                if (!string.IsNullOrEmpty(subscription))
                {
                    query = query.Where(u => u.SubscriptionStatus == subscription);
                }

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
                        u.Gender,
                        u.DateOfBirth,
                        u.AvatarUrl,
                        u.Role,
                        u.SubscriptionStatus,
                        u.PremiumExpiry,
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

        // GET: api/Admin/users/{id}
        [HttpGet("users/{id}")]
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

        // PUT: api/Admin/users/{id}/status
        [HttpPut("users/{id}/status")]
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

        // PUT: api/Admin/users/{id}/verify-email
        [HttpPut("users/{id}/verify-email")]
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
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}
