using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeroChat_BE.Models;

namespace SeroChat_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConversationsController : ControllerBase
    {
        private readonly SeroChatContext _context;
        private readonly ILogger<ConversationsController> _logger;

        public ConversationsController(SeroChatContext context, ILogger<ConversationsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách conversations của user
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserConversations(int userId)
        {
            try
            {
                var conversations = await _context.Conversations
                    .Where(c => c.UserId == userId)
                    .OrderByDescending(c => c.CreatedAt)
                    .Select(c => new
                    {
                        conversationId = c.ConvId,
                        title = c.Title,
                        messageCount = c.Messages.Count,
                        createdAt = c.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách cuộc trò chuyện thành công",
                    data = conversations
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting conversations for userId: {UserId}", userId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi lấy danh sách cuộc trò chuyện"
                });
            }
        }

        /// <summary>
        /// Lấy chi tiết conversation với tất cả messages
        /// </summary>
        [HttpGet("{conversationId}")]
        public async Task<IActionResult> GetConversationById(int conversationId)
        {
            try
            {
                var conversation = await _context.Conversations
                    .Include(c => c.Messages.OrderBy(m => m.SentAt))
                    .FirstOrDefaultAsync(c => c.ConvId == conversationId);

                if (conversation == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy cuộc trò chuyện"
                    });
                }

                var result = new
                {
                    conversationId = conversation.ConvId,
                    userId = conversation.UserId,
                    title = conversation.Title,
                    messageCount = conversation.Messages.Count,
                    createdAt = conversation.CreatedAt,
                    messages = conversation.Messages.Select(m => new
                    {
                        messageId = m.MsgId,
                        content = m.Content,
                        senderType = m.SenderType,
                        sentAt = m.SentAt
                    })
                };

                return Ok(new
                {
                    success = true,
                    message = "Lấy chi tiết cuộc trò chuyện thành công",
                    data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting conversation: {ConversationId}", conversationId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi lấy chi tiết cuộc trò chuyện"
                });
            }
        }
    }
}
