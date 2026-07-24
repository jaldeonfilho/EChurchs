namespace Echurchs.Models.Entities.Live;

public class ServiceSchedule
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string Name { get; set; } = string.Empty;
    public Echurchs.Models.Enums.DayOfWeek DayOfWeek { get; set; }
    public TimeSpan Time { get; set; }
    public Echurchs.Models.Enums.Frequency Frequency { get; set; } = Echurchs.Models.Enums.Frequency.Weekly;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Core.Community Community { get; set; } = null!;
    public ICollection<LiveService> LiveServices { get; set; } = new List<LiveService>();
}
