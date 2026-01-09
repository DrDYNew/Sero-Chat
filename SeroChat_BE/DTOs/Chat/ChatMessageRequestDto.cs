namespace SeroChat_BE.DTOs.Chat;

public class ChatMessageRequestDto
{
    public string Message { get; set; } = string.Empty;
    public int? UserId { get; set; }
}
