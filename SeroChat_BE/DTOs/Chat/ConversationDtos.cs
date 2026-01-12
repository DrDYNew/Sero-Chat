namespace SeroChat_BE.DTOs.Chat;

public class ConversationDto
{
    public int ConvId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? LastMessage { get; set; }
    public DateTime? LastMessageTime { get; set; }
}

public class ConversationDetailDto
{
    public int ConvId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<MessageDto> Messages { get; set; } = new();
}

public class MessageDto
{
    public int MsgId { get; set; }
    public string SenderType { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsCrisisDetected { get; set; }
    public DateTime SentAt { get; set; }
}

public class CreateConversationRequest
{
    public string? InitialMessage { get; set; }
}

public class CreateConversationResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public ConversationDto? Data { get; set; }
}

public class GetConversationsResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public List<ConversationDto>? Data { get; set; }
}

public class GetConversationDetailResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public ConversationDetailDto? Data { get; set; }
}

public class SendMessageToConversationRequest
{
    public int ConvId { get; set; }
    public string Message { get; set; } = string.Empty;
}
