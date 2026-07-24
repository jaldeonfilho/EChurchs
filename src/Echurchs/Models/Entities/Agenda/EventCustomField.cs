namespace Echurchs.Models.Entities.Agenda;

public class EventCustomField
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public Echurchs.Models.Enums.FieldType FieldType { get; set; }
    public bool IsRequired { get; set; }
    public string? Options { get; set; }

    public CalendarEvent Event { get; set; } = null!;
}
