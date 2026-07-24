namespace Echurchs.Models.Entities.Live;

public class LiveService
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public Guid? ScheduleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime ScheduledDate { get; set; }
    public Echurchs.Models.Enums.LiveServiceStatus Status { get; set; } = Echurchs.Models.Enums.LiveServiceStatus.Scheduled;
    public string? StreamUrl { get; set; }
    public string? ZoomMeetingId { get; set; }
    public string? ZoomMeetingPassword { get; set; }
    public string? ZoomJoinUrl { get; set; }
    public string? RecordingUrl { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Core.Community Community { get; set; } = null!;
    public ServiceSchedule? Schedule { get; set; }
    public Core.User Creator { get; set; } = null!;
}
