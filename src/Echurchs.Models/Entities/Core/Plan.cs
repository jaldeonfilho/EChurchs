namespace Echurchs.Models.Entities.Core;

public class Plan
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? PriceYearly { get; set; }
    public string? StripeProductId { get; set; }
    public string? StripePriceIdMonthly { get; set; }
    public string? StripePriceIdYearly { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PlanLimit> PlanLimits { get; set; } = new List<PlanLimit>();
    public ICollection<CommunitySubscription> CommunitySubscriptions { get; set; } = new List<CommunitySubscription>();
}
