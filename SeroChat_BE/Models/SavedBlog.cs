using System;
using System.Collections.Generic;

namespace SeroChat_BE.Models;

public partial class SavedBlog
{
    public int SavedId { get; set; }

    public int UserId { get; set; }

    public int BlogId { get; set; }

    public DateTime? SavedAt { get; set; }

    public virtual Blog Blog { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
