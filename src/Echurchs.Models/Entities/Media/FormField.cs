namespace Echurchs.Models.Entities.Media;

public class FormField
{
    public Guid Id { get; set; }
    public Guid FormTemplateId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public Echurchs.Models.Enums.FieldType FieldType { get; set; }
    public bool IsRequired { get; set; }
    public string? Options { get; set; }
    public int DisplayOrder { get; set; }

    public FormTemplate FormTemplate { get; set; } = null!;
}
