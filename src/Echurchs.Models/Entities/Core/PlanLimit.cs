namespace Echurchs.Models.Entities.Core;

public class PlanLimit
{
    public Guid Id { get; set; }
    public Guid PlanId { get; set; }
    public string Module { get; set; } = string.Empty;
    public string Feature { get; set; } = string.Empty;
    public int LimitValue { get; set; }
    public string? Description { get; set; }

    public Plan Plan { get; set; } = null!;
}
