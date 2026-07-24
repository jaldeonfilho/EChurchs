namespace Echurchs.Models.Entities.Groups;

public class GroupMember
{
    public Guid Id { get; set; }
    public Guid GroupId { get; set; }
    public Guid UserId { get; set; }
    public Echurchs.Models.Enums.GroupMemberRole Role { get; set; } = Echurchs.Models.Enums.GroupMemberRole.Member;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    public Group Group { get; set; } = null!;
    public Core.User User { get; set; } = null!;
}
