namespace Echurchs.Models.Dtos.Request;

public class UpdateCommunityRequestDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Nipc { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? LogoUrl { get; set; }
}
