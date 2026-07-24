namespace Echurchs.Models.Entities.Teaching;

public class ClassAttachment
{
    public Guid Id { get; set; }
    public Guid ClassId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Class Class { get; set; } = null!;
}
