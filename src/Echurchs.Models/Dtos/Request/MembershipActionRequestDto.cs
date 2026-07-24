namespace Echurchs.Models.Dtos.Request;

public class MembershipActionRequestDto
{
    public Guid MembershipId { get; set; }
    public string Action { get; set; } = string.Empty;
    public Models.Enums.CommunityRole? NewRole { get; set; }
}
