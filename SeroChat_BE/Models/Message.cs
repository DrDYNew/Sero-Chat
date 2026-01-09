using System;
using System.Collections.Generic;

namespace SeroChat_BE.Models;

public partial class Message
{
    public int MsgId { get; set; }

    public int ConvId { get; set; }

    public string? SenderType { get; set; }

    public string Content { get; set; } = null!;

    public bool? IsCrisisDetected { get; set; }

    public bool? IsDeleted { get; set; }

    public DateTime? SentAt { get; set; }

    public virtual Conversation Conv { get; set; } = null!;

    public virtual ICollection<CrisisAlertLog> CrisisAlertLogs { get; set; } = new List<CrisisAlertLog>();
}
