using Echurchs.Models.Enums;

namespace Echurchs.Models.Entities.Feed;

public class Post
{
    public Guid Id { get; set; }
    public Guid AuthorId { get; set; }
    public PostType Type { get; set; }
    public string? Content { get; set; }
    public string? MediaUrl { get; set; }
    public string? LiveUrl { get; set; }
    public string? EventTitle { get; set; }
    public DateTime? EventDate { get; set; }
    public DateTime? EventEndDate { get; set; }
    public string? EventLocation { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Core.User Author { get; set; } = null!;
}
