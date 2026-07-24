namespace Echurchs.Models.Entities.Teaching;

public class StudyAttachment
{
    public Guid Id { get; set; }
    public Guid StudyId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Study Study { get; set; } = null!;
}
