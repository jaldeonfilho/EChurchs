namespace Echurchs.Models.Entities.Media;

public class Photo
{
    public Guid Id { get; set; }
    public Guid AlbumId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? Caption { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public PhotoAlbum Album { get; set; } = null!;
}
