using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeroChat_BE.Models;

namespace SeroChat_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly SeroChatContext _context;
        private readonly ILogger<ProfileController> _logger;

        public ProfileController(SeroChatContext context, ILogger<ProfileController> logger)
        {
            _context = context;
            _logger = logger;
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
    }
}
