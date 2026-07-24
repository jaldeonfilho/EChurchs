namespace Echurchs.Models.Dtos.Response;

public class CommunityResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? Slug { get; set; }
    public int MemberCount { get; set; }
    public string? PlanName { get; set; }
    public DateTime CreatedAt { get; set; }
}
