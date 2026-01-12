using SeroChat_BE.Models;
using SeroChat_BE.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace SeroChat_BE.Services;

public interface IConversationService
{
    Task<List<Conversation>> GetUserConversations(int userId);
    Task<Conversation?> GetConversationById(int convId, int userId);
    Task<Conversation> CreateConversation(int userId, string? initialMessage = null);
    Task<List<Message>> GetConversationMessages(int convId, int userId);
    Task<Message> AddMessage(int convId, int userId, string content, string senderType, bool isCrisisDetected = false);
    Task<bool> DeleteConversation(int convId, int userId);
    Task<string> GenerateConversationTitle(string firstMessage);
}

public class ConversationService : IConversationService
{
    private readonly SeroChatContext _context;
    private readonly IGeminiService _geminiService;

    public ConversationService(SeroChatContext context, IGeminiService geminiService)
    {
        _context = context;
        _geminiService = geminiService;
    }

    public async Task<List<Conversation>> GetUserConversations(int userId)
    {
        return await _context.Conversations
            .Where(c => c.UserId == userId && c.IsDeleted != true)
            .OrderByDescending(c => c.CreatedAt)
            .Include(c => c.Messages.Where(m => m.IsDeleted != true).OrderByDescending(m => m.SentAt).Take(1))
            .ToListAsync();
    }

    public async Task<Conversation?> GetConversationById(int convId, int userId)
    {
        return await _context.Conversations
            .Include(c => c.Messages.Where(m => m.IsDeleted != true).OrderBy(m => m.SentAt))
            .FirstOrDefaultAsync(c => c.ConvId == convId && c.UserId == userId && c.IsDeleted != true);
    }

    public async Task<Conversation> CreateConversation(int userId, string? initialMessage = null)
    {
        var title = "Cuộc trò chuyện mới";
        
        // Generate title from initial message if provided
        if (!string.IsNullOrEmpty(initialMessage))
        {
            title = await GenerateConversationTitle(initialMessage);
        }

        var conversation = new Conversation
        {
            UserId = userId,
            Title = title,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Conversations.Add(conversation);
        await _context.SaveChangesAsync();

        return conversation;
    }

    public async Task<List<Message>> GetConversationMessages(int convId, int userId)
    {
        var conversation = await _context.Conversations
            .FirstOrDefaultAsync(c => c.ConvId == convId && c.UserId == userId && c.IsDeleted != true);

        if (conversation == null)
        {
            throw new UnauthorizedAccessException("Conversation not found or unauthorized");
        }

        return await _context.Messages
            .Where(m => m.ConvId == convId && m.IsDeleted != true)
            .OrderBy(m => m.SentAt)
            .ToListAsync();
    }

    public async Task<Message> AddMessage(int convId, int userId, string content, string senderType, bool isCrisisDetected = false)
    {
        var conversation = await _context.Conversations
            .FirstOrDefaultAsync(c => c.ConvId == convId && c.UserId == userId && c.IsDeleted != true);

        if (conversation == null)
        {
            throw new UnauthorizedAccessException("Conversation not found or unauthorized");
        }

        var message = new Message
        {
            ConvId = convId,
            SenderType = senderType,
            Content = content,
            IsCrisisDetected = isCrisisDetected,
            IsDeleted = false,
            SentAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        return message;
    }

    public async Task<bool> DeleteConversation(int convId, int userId)
    {
        var conversation = await _context.Conversations
            .FirstOrDefaultAsync(c => c.ConvId == convId && c.UserId == userId);

        if (conversation == null)
        {
            return false;
        }

        conversation.IsDeleted = true;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<string> GenerateConversationTitle(string firstMessage)
    {
        try
        {
            // Truncate message if too long
            var truncatedMessage = firstMessage.Length > 200 
                ? firstMessage.Substring(0, 200) 
                : firstMessage;

            var prompt = $"Tạo tiêu đề ngắn gọn (tối đa 50 ký tự) cho cuộc trò chuyện sau. Chỉ trả về tiêu đề, không giải thích:\n\n\"{truncatedMessage}\"";
            
            var (response, _) = await _geminiService.SendMessageAsync(prompt, null);
            
            // Clean up response
            var title = response.Trim().Trim('"').Trim();
            
            // Ensure title is not too long
            if (title.Length > 50)
            {
                title = title.Substring(0, 47) + "...";
            }

            // If generation failed or returned empty, use default
            if (string.IsNullOrWhiteSpace(title))
            {
                title = "Cuộc trò chuyện mới";
            }

            return title;
        }
        catch
        {
            return "Cuộc trò chuyện mới";
        }
    }
}
