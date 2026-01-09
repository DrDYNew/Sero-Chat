using System;
using System.Collections.Generic;

namespace SeroChat_BE.Models;

public partial class Blog
{
    public int BlogId { get; set; }

    public int BlogCatId { get; set; }

    public string Title { get; set; } = null!;

    public string Content { get; set; } = null!;

    public string? ThumbnailUrl { get; set; }

    public string? AuthorName { get; set; }

    public bool? IsDeleted { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual BlogCategory BlogCat { get; set; } = null!;

    public virtual ICollection<BlogReadHistory> BlogReadHistories { get; set; } = new List<BlogReadHistory>();

    public virtual ICollection<SavedBlog> SavedBlogs { get; set; } = new List<SavedBlog>();
}
