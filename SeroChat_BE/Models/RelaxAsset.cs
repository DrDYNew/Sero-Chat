using System;
using System.Collections.Generic;

namespace SeroChat_BE.Models;

public partial class RelaxAsset
{
    public int AssetId { get; set; }

    public string Title { get; set; } = null!;

    public string? Type { get; set; }

    public string MediaUrl { get; set; } = null!;

    public string? ThumbnailUrl { get; set; }

    public bool? IsPremium { get; set; }

    public bool? IsDeleted { get; set; }

    public DateTime? CreatedAt { get; set; }
}
