using System;
using System.Collections.Generic;

namespace SeroChat_BE.Models;

public partial class BlogReadHistory
{
    public int ReadId { get; set; }

    public int UserId { get; set; }

    public int BlogId { get; set; }

    public DateTime? ReadAt { get; set; }

    public virtual Blog Blog { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
