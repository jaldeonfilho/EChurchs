namespace Echurchs.Models.Entities.Media;

public class VideoAlbum
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Core.Community Community { get; set; } = null!;
    public ICollection<Video> Videos { get; set; } = new List<Video>();
}
