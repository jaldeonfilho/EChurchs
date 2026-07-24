namespace Echurchs.Models.Entities.Media;

public class FormResponseValue
{
    public Guid Id { get; set; }
    public Guid ResponseId { get; set; }
    public Guid FormFieldId { get; set; }
    public string Value { get; set; } = string.Empty;

    public FormResponse Response { get; set; } = null!;
    public FormField FormField { get; set; } = null!;
}
