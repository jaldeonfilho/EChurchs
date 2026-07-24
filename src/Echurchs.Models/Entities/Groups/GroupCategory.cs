namespace Echurchs.Models.Entities.Groups;

public class GroupCategory
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public Core.Community Community { get; set; } = null!;
    public ICollection<Group> Groups { get; set; } = new List<Group>();
}
