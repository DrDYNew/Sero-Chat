using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using SeroChat_BE.Models;

namespace SeroChat_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MoodLogsController : ControllerBase
    {
        private readonly SeroChatContext _context;
        private readonly ILogger<MoodLogsController> _logger;

        public MoodLogsController(SeroChatContext context, ILogger<MoodLogsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : 0;
        }

        /// <summary>
        /// Lấy danh sách mood logs của user hiện tại
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetMoodLogs()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return Unauthorized(new { success = false, message = "Unauthorized" });
                }

                var moodLogs = await _context.MoodLogs
                    .Where(ml => ml.UserId == userId)
                    .OrderByDescending(ml => ml.CreatedAt)
                    .Select(ml => new
                    {
                        logId = ml.LogId,
                        userId = ml.UserId,
                        moodScore = ml.MoodScore,
                        note = ml.Note,
                        createdAt = ml.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = moodLogs
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mood logs");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi lấy danh sách nhật ký tâm trạng"
                });
            }
        }

        /// <summary>
        /// Tạo mood log mới
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateMoodLog([FromBody] CreateMoodLogRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return Unauthorized(new { success = false, message = "Unauthorized" });
                }

                var moodLog = new MoodLog
                {
                    UserId = userId,
                    MoodScore = request.MoodScore,
                    Note = request.Note,
                    CreatedAt = DateTime.UtcNow
                };

                _context.MoodLogs.Add(moodLog);
                await _context.SaveChangesAsync();

                // Tạo notification
                var moodEmoji = request.MoodScore switch
                {
                    5 => "😊",
                    4 => "🙂",
                    3 => "😐",
                    2 => "😟",
                    1 => "😢",
                    _ => "😐"
                };
                var notification = new Notification
                {
                    UserId = userId,
                    Title = "Đã ghi nhận tâm trạng",
                    Content = $"Tâm trạng hôm nay của bạn: {moodEmoji} ({request.MoodScore}/5)",
                    IsRead = false,
                    CreatedAt = DateTime.Now
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Đã lưu nhật ký tâm trạng",
                    data = new
                    {
                        logId = moodLog.LogId,
                        userId = moodLog.UserId,
                        moodScore = moodLog.MoodScore,
                        note = moodLog.Note,
                        createdAt = moodLog.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mood log");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi lưu nhật ký tâm trạng"
                });
            }
        }

        /// <summary>
        /// Xóa mood log
        /// </summary>
        [HttpDelete("{logId}")]
        public async Task<IActionResult> DeleteMoodLog(int logId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return Unauthorized(new { success = false, message = "Unauthorized" });
                }

                var moodLog = await _context.MoodLogs
                    .FirstOrDefaultAsync(ml => ml.LogId == logId && ml.UserId == userId);

                if (moodLog == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy nhật ký tâm trạng"
                    });
                }

                _context.MoodLogs.Remove(moodLog);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Đã xóa nhật ký tâm trạng"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mood log");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi xóa nhật ký tâm trạng"
                });
            }
        }

        /// <summary>
        /// Lấy thống kê mood logs
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetMoodStats()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return Unauthorized(new { success = false, message = "Unauthorized" });
                }

                var moodLogs = await _context.MoodLogs
                    .Where(ml => ml.UserId == userId)
                    .OrderByDescending(ml => ml.CreatedAt)
                    .ToListAsync();

                var totalLogs = moodLogs.Count;
                var averageScore = totalLogs > 0 ? moodLogs.Average(ml => ml.MoodScore ?? 0) : 0;
                var latestMood = moodLogs.FirstOrDefault();

                // Calculate streak (consecutive days with mood logs)
                var streak = 0;
                var currentDate = DateTime.UtcNow.Date;
                var dates = moodLogs
                    .Select(ml => ml.CreatedAt?.Date)
                    .Where(d => d.HasValue)
                    .Distinct()
                    .OrderByDescending(d => d)
                    .ToList();

                foreach (var date in dates)
                {
                    if (date == currentDate)
                    {
                        streak++;
                        currentDate = currentDate.AddDays(-1);
                    }
                    else
                    {
                        break;
                    }
                }

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        totalLogs,
                        averageScore = Math.Round(averageScore, 1),
                        latestMood = latestMood != null ? new
                        {
                            logId = latestMood.LogId,
                            moodScore = latestMood.MoodScore,
                            note = latestMood.Note,
                            createdAt = latestMood.CreatedAt
                        } : null,
                        streak
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mood stats");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi lấy thống kê"
                });
            }
        }
    }

    public class CreateMoodLogRequest
    {
        public int MoodScore { get; set; }
        public string? Note { get; set; }
    }
}
