namespace Echurchs.Models.Entities.Teaching;

public class ClassMember
{
    public Guid Id { get; set; }
    public Guid ClassId { get; set; }
    public Guid UserId { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public Echurchs.Models.Enums.ClassStatus Status { get; set; } = Echurchs.Models.Enums.ClassStatus.Active;

    public Class Class { get; set; } = null!;
    public Core.User User { get; set; } = null!;
}
