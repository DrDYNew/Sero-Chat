using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeroChat_BE.Models;

namespace SeroChat_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly SeroChatContext _context;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(SeroChatContext context, ILogger<NotificationsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách notifications của user
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserNotifications(int userId, [FromQuery] bool? isRead = null)
        {
            try
            {
                var query = _context.Notifications
                    .Where(n => n.UserId == userId)
                    .AsQueryable();

                if (isRead.HasValue)
                {
                    query = query.Where(n => n.IsRead == isRead.Value);
                }

                var notifications = await query
                    .OrderByDescending(n => n.CreatedAt)
                    .Select(n => new
                    {
                        notificationId = n.NotifyId,
                        n.UserId,
                        n.Title,
                        content = n.Content,
                        n.IsRead,
                        n.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách thông báo thành công",
                    data = notifications
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notifications for userId: {UserId}", userId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi lấy thông báo"
                });
            }
        }

        /// <summary>
        /// Đếm số notifications chưa đọc
        /// </summary>
        [HttpGet("user/{userId}/unread-count")]
        public async Task<IActionResult> GetUnreadCount(int userId)
        {
            try
            {
                var count = await _context.Notifications
                    .CountAsync(n => n.UserId == userId && n.IsRead == false);

                return Ok(new
                {
                    success = true,
                    data = new { unreadCount = count }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread count for userId: {UserId}", userId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi"
                });
            }
        }

        /// <summary>
        /// Đánh dấu một notification là đã đọc
        /// </summary>
        [HttpPut("{notificationId}/mark-read")]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            try
            {
                var notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.NotifyId == notificationId);

                if (notification == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy thông báo"
                    });
                }

                notification.IsRead = true;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Đã đánh dấu là đã đọc"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification as read: {NotificationId}", notificationId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi"
                });
            }
        }

        /// <summary>
        /// Đánh dấu tất cả notifications là đã đọc
        /// </summary>
        [HttpPut("user/{userId}/mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead(int userId)
        {
            try
            {
                var notifications = await _context.Notifications
                    .Where(n => n.UserId == userId && n.IsRead == false)
                    .ToListAsync();

                foreach (var notification in notifications)
                {
                    notification.IsRead = true;
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = $"Đã đánh dấu {notifications.Count} thông báo là đã đọc"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all notifications as read for userId: {UserId}", userId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi"
                });
            }
        }

        /// <summary>
        /// Tạo notification mới (internal use)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationRequest request)
        {
            try
            {
                var notification = new Notification
                {
                    UserId = request.UserId,
                    Title = request.Title,
                    Content = request.Message,
                    IsRead = false,
                    CreatedAt = DateTime.Now
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Tạo thông báo thành công",
                    data = new
                    {
                        notificationId = notification.NotifyId,
                        notification.UserId,
                        notification.Title,
                        content = notification.Content,
                        notification.IsRead,
                        notification.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi tạo thông báo"
                });
            }
        }

        /// <summary>
        /// Xóa notification
        /// </summary>
        [HttpDelete("{notificationId}")]
        public async Task<IActionResult> DeleteNotification(int notificationId)
        {
            try
            {
                var notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.NotifyId == notificationId);

                if (notification == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy thông báo"
                    });
                }

                _context.Notifications.Remove(notification);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Đã xóa thông báo"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification: {NotificationId}", notificationId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi"
                });
            }
        }

        /// <summary>
        /// Xóa tất cả notifications của user
        /// </summary>
        [HttpDelete("user/{userId}")]
        public async Task<IActionResult> DeleteAllNotifications(int userId)
        {
            try
            {
                var notifications = await _context.Notifications
                    .Where(n => n.UserId == userId)
                    .ToListAsync();

                _context.Notifications.RemoveRange(notifications);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = $"Đã xóa {notifications.Count} thông báo"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting all notifications for userId: {UserId}", userId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi"
                });
            }
        }
    }

    public class CreateNotificationRequest
    {
        public int UserId { get; set; }
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
    }
}
