using System;
using System.Collections.Generic;

namespace SeroChat_BE.Models;

public partial class CrisisAlertLog
{
    public int AlertId { get; set; }

    public int? UserId { get; set; }

    public int? MsgId { get; set; }

    public DateTime? AlertTime { get; set; }

    public bool? IsResolved { get; set; }

    public virtual Message? Msg { get; set; }

    public virtual User? User { get; set; }
}
