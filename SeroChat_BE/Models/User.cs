using System;
using System.Collections.Generic;

namespace SeroChat_BE.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Email { get; set; } = null!;

    public string? PasswordHash { get; set; }

    public string? GoogleId { get; set; }

    public string? AuthProvider { get; set; }

    public string? FullName { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Gender { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    public string? AvatarUrl { get; set; }

    public string? Role { get; set; }

    public string? SubscriptionStatus { get; set; }

    public DateTime? PremiumExpiry { get; set; }

    public int MessagesSentToday { get; set; }

    public DateTime? LastMessageResetDate { get; set; }

    public string? Theme { get; set; }

    public string? Language { get; set; }

    public string? Status { get; set; }

    public bool? IsVerify { get; set; }

    public bool? IsDeleted { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<BlogReadHistory> BlogReadHistories { get; set; } = new List<BlogReadHistory>();

    public virtual ICollection<Conversation> Conversations { get; set; } = new List<Conversation>();

    public virtual ICollection<CrisisAlertLog> CrisisAlertLogs { get; set; } = new List<CrisisAlertLog>();

    public virtual ICollection<MoodLog> MoodLogs { get; set; } = new List<MoodLog>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<SavedBlog> SavedBlogs { get; set; } = new List<SavedBlog>();

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
