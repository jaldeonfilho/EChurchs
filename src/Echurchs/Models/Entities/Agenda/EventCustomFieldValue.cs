namespace Echurchs.Models.Entities.Agenda;

public class EventCustomFieldValue
{
    public Guid Id { get; set; }
    public Guid RegistrationId { get; set; }
    public Guid CustomFieldId { get; set; }
    public string Value { get; set; } = string.Empty;

    public EventRegistration Registration { get; set; } = null!;
    public EventCustomField CustomField { get; set; } = null!;
}
