using System;
using System.Collections.Generic;

namespace SeroChat_BE.Models;

public partial class Transaction
{
    public long OrderCode { get; set; }

    public int UserId { get; set; }

    public int PlanId { get; set; }

    public decimal Amount { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual SubscriptionPlan Plan { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
