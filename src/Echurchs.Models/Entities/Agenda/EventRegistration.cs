namespace Echurchs.Models.Entities.Agenda;

public class EventRegistration
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public Guid UserId { get; set; }
    public Echurchs.Models.Enums.RegistrationStatus Status { get; set; } = Echurchs.Models.Enums.RegistrationStatus.Registered;
    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

    public CalendarEvent Event { get; set; } = null!;
    public Core.User User { get; set; } = null!;
    public ICollection<EventCustomFieldValue> CustomFieldValues { get; set; } = new List<EventCustomFieldValue>();
}
