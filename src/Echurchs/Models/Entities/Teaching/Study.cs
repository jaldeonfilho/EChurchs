namespace Echurchs.Models.Entities.Teaching;

public class Study
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Content { get; set; }
    public Guid AuthorId { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Core.Community Community { get; set; } = null!;
    public Core.User Author { get; set; } = null!;
    public ICollection<StudyAttachment> Attachments { get; set; } = new List<StudyAttachment>();
}
