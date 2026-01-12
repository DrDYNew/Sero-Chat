using SeroChat_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace SeroChat_BE.Services;

public interface IChatLimitService
{
    Task<int> GetDailyLimit(int userId);
    Task<(bool canSend, int remaining, string? message)> CheckAndIncrementMessageCount(int userId);
    Task ResetDailyCountIfNeeded(int userId);
}

public class ChatLimitService : IChatLimitService
{
    private readonly SeroChatContext _context;
    private const int GUEST_DAILY_LIMIT = 5;
    private const int BASE_DAILY_LIMIT = 30;

    public ChatLimitService(SeroChatContext context)
    {
        _context = context;
    }

    public async Task<int> GetDailyLimit(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return 0;

        // Reset if needed
        await ResetDailyCountIfNeeded(userId);

        // Base limit for logged-in users
        int totalLimit = BASE_DAILY_LIMIT;

        // Add limits from active subscription plans
        var today = DateTime.UtcNow;
        var activeTransactions = await _context.Transactions
            .Include(t => t.Plan)
            .Where(t => t.UserId == userId 
                && t.PaymentStatus == "paid" 
                && t.StartDate <= today 
                && t.EndDate >= today)
            .ToListAsync();

        foreach (var transaction in activeTransactions)
        {
            if (transaction.Plan?.DailyMessageLimit.HasValue == true)
            {
                totalLimit += transaction.Plan.DailyMessageLimit.Value;
            }
        }

        return totalLimit;
    }

    public async Task<(bool canSend, int remaining, string? message)> CheckAndIncrementMessageCount(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return (false, 0, "User not found");
        }

        // Reset if needed
        await ResetDailyCountIfNeeded(userId);

        // Reload user after potential reset
        user = await _context.Users.FindAsync(userId);
        
        var dailyLimit = await GetDailyLimit(userId);
        var currentCount = user!.MessagesSentToday;

        if (currentCount >= dailyLimit)
        {
            return (false, 0, $"Bạn đã sử dụng hết {dailyLimit} lượt chat trong ngày. Vui lòng mua gói dịch vụ để tiếp tục.");
        }

        // Increment count
        user.MessagesSentToday++;
        await _context.SaveChangesAsync();

        var remaining = dailyLimit - user.MessagesSentToday;
        return (true, remaining, null);
    }

    public async Task ResetDailyCountIfNeeded(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return;

        var today = DateTime.UtcNow.Date;
        var lastResetDate = user.LastMessageResetDate?.Date;

        // If last reset was before today, reset the count
        if (!lastResetDate.HasValue || lastResetDate.Value < today)
        {
            user.MessagesSentToday = 0;
            user.LastMessageResetDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
