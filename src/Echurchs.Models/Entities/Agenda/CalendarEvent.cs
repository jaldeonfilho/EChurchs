namespace Echurchs.Models.Entities.Agenda;

public class CalendarEvent
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Location { get; set; }
    public int MaxAttendees { get; set; } = 999999;
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Core.Community Community { get; set; } = null!;
    public Core.User Creator { get; set; } = null!;
    public ICollection<EventRegistration> Registrations { get; set; } = new List<EventRegistration>();
    public ICollection<EventCustomField> CustomFields { get; set; } = new List<EventCustomField>();
}
