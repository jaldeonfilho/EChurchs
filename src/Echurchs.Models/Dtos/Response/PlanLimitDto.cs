namespace Echurchs.Models.Dtos.Response;

public class PlanLimitDto
{
    public string Module { get; set; } = string.Empty;
    public string Feature { get; set; } = string.Empty;
    public int LimitValue { get; set; }
    public string? Description { get; set; }
}
