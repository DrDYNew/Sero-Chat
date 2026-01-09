using System;
using System.Collections.Generic;

namespace SeroChat_BE.Models;

public partial class DailyAffirmation
{
    public int AffId { get; set; }

    public string Content { get; set; } = null!;

    public bool? IsDeleted { get; set; }

    public DateTime? CreatedAt { get; set; }
}
