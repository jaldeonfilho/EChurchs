namespace Echurchs.Models.Dtos.Response;

public class PlanUsageResponseDto
{
    public Guid PlanId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string BillingCycle { get; set; } = string.Empty;
    public DateTime? CurrentPeriodEnd { get; set; }
    public bool CancelAtPeriodEnd { get; set; }
    public List<PlanUsageItemDto> Items { get; set; } = new();
}
