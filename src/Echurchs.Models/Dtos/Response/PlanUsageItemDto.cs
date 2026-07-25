namespace Echurchs.Models.Dtos.Response;

public class PlanUsageItemDto
{
    public string Module { get; set; } = string.Empty;
    public string Feature { get; set; } = string.Empty;
    public int LimitValue { get; set; }
    public int CurrentUsage { get; set; }
    public bool IsUnlimited { get; set; }
    public string? Description { get; set; }
}
