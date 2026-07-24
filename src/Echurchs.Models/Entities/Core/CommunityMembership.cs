namespace Echurchs.Models.Entities.Core;

public class CommunityMembership
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CommunityId { get; set; }
    public Echurchs.Models.Enums.CommunityRole Role { get; set; } = Echurchs.Models.Enums.CommunityRole.Member;
    public Echurchs.Models.Enums.MembershipStatus Status { get; set; } = Echurchs.Models.Enums.MembershipStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? JoinedAt { get; set; }

    public User User { get; set; } = null!;
    public Community Community { get; set; } = null!;
}
