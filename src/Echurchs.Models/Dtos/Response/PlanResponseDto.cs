namespace Echurchs.Models.Dtos.Response;

public class PlanResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? PriceYearly { get; set; }
    public string? Description { get; set; }
    public List<PlanLimitDto> Limits { get; set; } = new();
}
