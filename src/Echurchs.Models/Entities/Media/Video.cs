namespace Echurchs.Models.Entities.Media;

public class Video
{
    public Guid Id { get; set; }
    public Guid AlbumId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TimeSpan? Duration { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public VideoAlbum Album { get; set; } = null!;
}
