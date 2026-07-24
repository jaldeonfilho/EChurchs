namespace Echurchs.Models.Entities.Media;

public class FormResponse
{
    public Guid Id { get; set; }
    public Guid FormTemplateId { get; set; }
    public Guid? UserId { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public FormTemplate FormTemplate { get; set; } = null!;
    public Core.User? User { get; set; }
    public ICollection<FormResponseValue> Values { get; set; } = new List<FormResponseValue>();
}
