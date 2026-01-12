namespace SeroChat_BE.DTOs.Chat;

public class ChatLimitResponse
{
    public bool Success { get; set; }
    public int DailyLimit { get; set; }
    public int MessagesSentToday { get; set; }
    public int Remaining { get; set; }
    public string? Message { get; set; }
}

public class SendMessageRequest
{
    public string Message { get; set; } = string.Empty;
    public int? ConversationId { get; set; }
}

public class SendMessageResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public int? Remaining { get; set; }
    public ChatMessageDto? Data { get; set; }
}

public class ChatMessageDto
{
    public int MessageId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string Sender { get; set; } = string.Empty; // "user" or "ai"
    public DateTime SentAt { get; set; }
}
