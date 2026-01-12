using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using SeroChat_BE.DTOs.Chat;
using SeroChat_BE.Interfaces;
using SeroChat_BE.Services;

namespace SeroChat_BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IGeminiService _geminiService;
    private readonly IChatLimitService _chatLimitService;
    private readonly IConversationService _conversationService;
    private readonly ILogger<ChatController> _logger;

    public ChatController(
        IGeminiService geminiService, 
        IChatLimitService chatLimitService,
        IConversationService conversationService,
        ILogger<ChatController> logger)
    {
        _geminiService = geminiService;
        _chatLimitService = chatLimitService;
        _conversationService = conversationService;
        _logger = logger;
    }

    [HttpGet("daily-limit")]
    [Authorize]
    public async Task<ActionResult<ChatLimitResponse>> GetDailyLimit()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new ChatLimitResponse 
                { 
                    Success = false, 
                    Message = "Unauthorized" 
                });
            }

            var dailyLimit = await _chatLimitService.GetDailyLimit(userId);
            await _chatLimitService.ResetDailyCountIfNeeded(userId);
            
            // Get current count from database
            var context = HttpContext.RequestServices.GetRequiredService<Models.SeroChatContext>();
            var userEntity = await context.Users.FindAsync(userId);
            
            return Ok(new ChatLimitResponse
            {
                Success = true,
                DailyLimit = dailyLimit,
                MessagesSentToday = userEntity?.MessagesSentToday ?? 0,
                Remaining = dailyLimit - (userEntity?.MessagesSentToday ?? 0)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting daily limit");
            return StatusCode(500, new ChatLimitResponse 
            { 
                Success = false, 
                Message = "Đã xảy ra lỗi" 
            });
        }
    }

    [HttpPost("send")]
    [Authorize]
    public async Task<ActionResult<ChatMessageResponseDto>> SendMessage([FromBody] ChatMessageRequestDto request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new ChatMessageResponseDto
                {
                    Success = false,
                    Error = "Tin nhắn không được để trống"
                });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new ChatMessageResponseDto 
                { 
                    Success = false, 
                    Error = "Unauthorized" 
                });
            }

            // Check and increment message count
            var (canSend, remaining, message) = await _chatLimitService.CheckAndIncrementMessageCount(userId);
            if (!canSend)
            {
                return Ok(new ChatMessageResponseDto
                {
                    Success = false,
                    Error = message,
                    RemainingMessages = 0
                });
            }

            var (response, isCrisis) = await _geminiService.SendMessageAsync(request.Message, userId);

            return Ok(new ChatMessageResponseDto
            {
                Response = response,
                Success = true,
                IsCrisisDetected = isCrisis,
                RemainingMessages = remaining
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chat message");
            return StatusCode(500, new ChatMessageResponseDto
            {
                Success = false,
                Error = "Đã xảy ra lỗi khi xử lý tin nhắn"
            });
        }
    }

    [HttpPost("check-inappropriate")]
    public async Task<ActionResult<bool>> CheckInappropriate([FromBody] ChatMessageRequestDto request)
    {
        try
        {
            var isInappropriate = await _geminiService.CheckInappropriateContentAsync(request.Message);
            return Ok(isInappropriate);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking inappropriate content");
            return StatusCode(500, false);
        }
    }

    // ===== CONVERSATION ENDPOINTS =====

    [HttpGet("conversations")]
    [Authorize]
    public async Task<ActionResult<GetConversationsResponse>> GetConversations()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new GetConversationsResponse 
                { 
                    Success = false, 
                    Message = "Unauthorized" 
                });
            }

            var conversations = await _conversationService.GetUserConversations(userId);
            
            var conversationDtos = conversations.Select(c => new ConversationDto
            {
                ConvId = c.ConvId,
                Title = c.Title ?? "Cuộc trò chuyện mới",
                CreatedAt = c.CreatedAt ?? DateTime.UtcNow,
                LastMessage = c.Messages.FirstOrDefault()?.Content,
                LastMessageTime = c.Messages.FirstOrDefault()?.SentAt
            }).ToList();

            return Ok(new GetConversationsResponse
            {
                Success = true,
                Data = conversationDtos
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting conversations");
            return StatusCode(500, new GetConversationsResponse
            {
                Success = false,
                Message = "Đã xảy ra lỗi"
            });
        }
    }

    [HttpPost("conversations")]
    [Authorize]
    public async Task<ActionResult<CreateConversationResponse>> CreateConversation([FromBody] CreateConversationRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new CreateConversationResponse 
                { 
                    Success = false, 
                    Message = "Unauthorized" 
                });
            }

            var conversation = await _conversationService.CreateConversation(userId, request.InitialMessage);

            return Ok(new CreateConversationResponse
            {
                Success = true,
                Data = new ConversationDto
                {
                    ConvId = conversation.ConvId,
                    Title = conversation.Title ?? "Cuộc trò chuyện mới",
                    CreatedAt = conversation.CreatedAt ?? DateTime.UtcNow
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating conversation");
            return StatusCode(500, new CreateConversationResponse
            {
                Success = false,
                Message = "Đã xảy ra lỗi"
            });
        }
    }

    [HttpGet("conversations/{convId}")]
    [Authorize]
    public async Task<ActionResult<GetConversationDetailResponse>> GetConversationDetail(int convId)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new GetConversationDetailResponse 
                { 
                    Success = false, 
                    Message = "Unauthorized" 
                });
            }

            var conversation = await _conversationService.GetConversationById(convId, userId);
            if (conversation == null)
            {
                return NotFound(new GetConversationDetailResponse
                {
                    Success = false,
                    Message = "Conversation not found"
                });
            }

            var conversationDto = new ConversationDetailDto
            {
                ConvId = conversation.ConvId,
                Title = conversation.Title ?? "Cuộc trò chuyện mới",
                CreatedAt = conversation.CreatedAt ?? DateTime.UtcNow,
                Messages = conversation.Messages.Select(m => new MessageDto
                {
                    MsgId = m.MsgId,
                    SenderType = m.SenderType ?? "USER",
                    Content = m.Content,
                    IsCrisisDetected = m.IsCrisisDetected ?? false,
                    SentAt = m.SentAt ?? DateTime.UtcNow
                }).ToList()
            };

            return Ok(new GetConversationDetailResponse
            {
                Success = true,
                Data = conversationDto
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting conversation detail");
            return StatusCode(500, new GetConversationDetailResponse
            {
                Success = false,
                Message = "Đã xảy ra lỗi"
            });
        }
    }

    [HttpPost("conversations/send")]
    [Authorize]
    public async Task<ActionResult<ChatMessageResponseDto>> SendMessageToConversation([FromBody] SendMessageToConversationRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new ChatMessageResponseDto
                {
                    Success = false,
                    Error = "Tin nhắn không được để trống"
                });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new ChatMessageResponseDto 
                { 
                    Success = false, 
                    Error = "Unauthorized" 
                });
            }

            // Check and increment message count
            var (canSend, remaining, message) = await _chatLimitService.CheckAndIncrementMessageCount(userId);
            if (!canSend)
            {
                return Ok(new ChatMessageResponseDto
                {
                    Success = false,
                    Error = message,
                    RemainingMessages = 0
                });
            }

            // Save user message
            await _conversationService.AddMessage(request.ConvId, userId, request.Message, "USER");

            // Get AI response
            var (response, isCrisis) = await _geminiService.SendMessageAsync(request.Message, userId);

            // Save AI message
            await _conversationService.AddMessage(request.ConvId, userId, response, "SERO", isCrisis);

            return Ok(new ChatMessageResponseDto
            {
                Response = response,
                Success = true,
                IsCrisisDetected = isCrisis,
                RemainingMessages = remaining
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new ChatMessageResponseDto
            {
                Success = false,
                Error = "Unauthorized"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message to conversation");
            return StatusCode(500, new ChatMessageResponseDto
            {
                Success = false,
                Error = "Đã xảy ra lỗi khi xử lý tin nhắn"
            });
        }
    }

    [HttpDelete("conversations/{convId}")]
    [Authorize]
    public async Task<ActionResult> DeleteConversation(int convId)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { success = false, message = "Unauthorized" });
            }

            var result = await _conversationService.DeleteConversation(convId, userId);
            if (!result)
            {
                return NotFound(new { success = false, message = "Conversation not found" });
            }

            return Ok(new { success = true, message = "Conversation deleted" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting conversation");
            return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi" });
        }
    }
}
