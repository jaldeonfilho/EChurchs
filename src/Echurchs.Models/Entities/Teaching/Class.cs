namespace Echurchs.Models.Entities.Teaching;

public class Class
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? TeacherId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Core.Community Community { get; set; } = null!;
    public Core.User? Teacher { get; set; }
    public ICollection<ClassAttachment> Attachments { get; set; } = new List<ClassAttachment>();
    public ICollection<ClassMember> Members { get; set; } = new List<ClassMember>();
}
