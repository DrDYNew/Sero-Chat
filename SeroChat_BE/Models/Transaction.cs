using System;
using System.Collections.Generic;

namespace SeroChat_BE.Models;

public partial class Transaction
{
    public long OrderCode { get; set; }

    public int UserId { get; set; }

    public int PlanId { get; set; }

    public decimal Amount { get; set; }

    public string? Status { get; set; } // PENDING, PAID, CANCELLED

    public DateTime? CreatedAt { get; set; }

    public string? PaymentMethod { get; set; } // PayOS, Cash, etc

    public string? PaymentStatus { get; set; } // Pending, Completed, Failed

    public DateTime? TransactionDate { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public string? PayOSTransactionId { get; set; }

    public string? Description { get; set; }

    public virtual SubscriptionPlan Plan { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
