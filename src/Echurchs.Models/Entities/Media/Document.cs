namespace Echurchs.Models.Entities.Media;

public class Document
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? Category { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Core.Community Community { get; set; } = null!;
    public Core.User Creator { get; set; } = null!;
}
