namespace SeroChat_BE.DTOs.Chat;

public class ChatMessageResponseDto
{
    public string Response { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? Error { get; set; }
    public bool IsCrisisDetected { get; set; } = false;
}
