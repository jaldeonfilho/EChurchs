using Echurchs.Models.Dtos.Response;

namespace Echurchs.Service.Interfaces;

public class PlanLimitCheckResult
{
    public bool Allowed { get; set; }
    public int LimitValue { get; set; }
    public int CurrentUsage { get; set; }
    public string PlanName { get; set; } = string.Empty;
}

public interface IPlanLimitService
{
    Task<PlanLimitCheckResult> CheckLimitAsync(Guid communityId, string module, string feature);
    Task<List<PlanUsageItemDto>> GetUsageSummaryAsync(Guid communityId);
}
