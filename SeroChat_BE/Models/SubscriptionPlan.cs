using System;
using System.Collections.Generic;

namespace SeroChat_BE.Models;

public partial class SubscriptionPlan
{
    public int PlanId { get; set; }

    public string PlanName { get; set; } = null!;

    public decimal Price { get; set; }

    public int DurationDays { get; set; }

    public int? DailyMessageLimit { get; set; }

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
