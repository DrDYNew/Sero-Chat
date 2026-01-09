using System;
using System.Collections.Generic;

namespace SeroChat_BE.Models;

public partial class Notification
{
    public int NotifyId { get; set; }

    public int UserId { get; set; }

    public string? Title { get; set; }

    public string? Content { get; set; }

    public bool? IsRead { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
