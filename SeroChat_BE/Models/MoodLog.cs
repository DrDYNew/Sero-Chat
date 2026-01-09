using System;
using System.Collections.Generic;

namespace SeroChat_BE.Models;

public partial class MoodLog
{
    public int LogId { get; set; }

    public int UserId { get; set; }

    public int? MoodScore { get; set; }

    public string? Note { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
