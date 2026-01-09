using Microsoft.AspNetCore.Mvc;
using SeroChat_BE.DTOs.Chat;
using SeroChat_BE.Interfaces;

namespace SeroChat_BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IGeminiService _geminiService;
    private readonly ILogger<ChatController> _logger;

    public ChatController(IGeminiService geminiService, ILogger<ChatController> logger)
    {
        _geminiService = geminiService;
        _logger = logger;
    }

    [HttpPost("send")]
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

            var (response, isCrisis) = await _geminiService.SendMessageAsync(request.Message, request.UserId);

            return Ok(new ChatMessageResponseDto
            {
                Response = response,
                Success = true,
                IsCrisisDetected = isCrisis
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
}
