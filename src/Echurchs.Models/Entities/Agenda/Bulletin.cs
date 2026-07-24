namespace Echurchs.Models.Entities.Agenda;

public class Bulletin
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public Guid AuthorId { get; set; }
    public Echurchs.Models.Enums.BulletinStatus Status { get; set; } = Echurchs.Models.Enums.BulletinStatus.Draft;
    public DateTime PublishDate { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Core.Community Community { get; set; } = null!;
    public Core.User Author { get; set; } = null!;
}
