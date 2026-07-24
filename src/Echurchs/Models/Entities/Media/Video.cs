namespace Echurchs.Models.Entities.Media;

public class Video
{
    public Guid Id { get; set; }
    public Guid AlbumId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public VideoAlbum Album { get; set; } = null!;
}
