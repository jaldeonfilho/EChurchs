namespace Echurchs.Models.Entities.Groups;

public class Group
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? LeaderId { get; set; }
    public int? MaxMembers { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Core.Community Community { get; set; } = null!;
    public GroupCategory? Category { get; set; }
    public Core.User? Leader { get; set; }
    public ICollection<GroupMember> Members { get; set; } = new List<GroupMember>();
}
