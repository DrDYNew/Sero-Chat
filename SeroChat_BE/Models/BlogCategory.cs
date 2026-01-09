using System;
using System.Collections.Generic;

namespace SeroChat_BE.Models;

public partial class BlogCategory
{
    public int BlogCatId { get; set; }

    public string CategoryName { get; set; } = null!;

    public string? Description { get; set; }

    public virtual ICollection<Blog> Blogs { get; set; } = new List<Blog>();
}
