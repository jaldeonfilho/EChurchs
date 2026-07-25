namespace Echurchs.Models.Entities.Core;

public class CommunitySubscription
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public Guid PlanId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Echurchs.Models.Enums.SubscriptionStatus Status { get; set; } = Echurchs.Models.Enums.SubscriptionStatus.Active;
    public Echurchs.Models.Enums.BillingCycle BillingCycle { get; set; } = Echurchs.Models.Enums.BillingCycle.Monthly;
    public string? PaymentMethod { get; set; }
    public string? StripeCustomerId { get; set; }
    public string? StripeSubscriptionId { get; set; }
    public DateTime? CurrentPeriodEnd { get; set; }
    public bool CancelAtPeriodEnd { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Community Community { get; set; } = null!;
    public Plan Plan { get; set; } = null!;
}
