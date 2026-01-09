using System;
using System.Collections.Generic;

namespace SeroChat_BE.Models;

public partial class Conversation
{
    public int ConvId { get; set; }

    public int UserId { get; set; }

    public string? Title { get; set; }

    public bool? IsDeleted { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    public virtual User User { get; set; } = null!;
}
