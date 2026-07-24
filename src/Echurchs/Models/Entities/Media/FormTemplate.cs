namespace Echurchs.Models.Entities.Media;

public class FormTemplate
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Core.Community Community { get; set; } = null!;
    public ICollection<FormField> Fields { get; set; } = new List<FormField>();
    public ICollection<FormResponse> Responses { get; set; } = new List<FormResponse>();
}
