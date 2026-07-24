namespace Echurchs.Models.Entities.Financial;

public class GivingStatement
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public Guid UserId { get; set; }
    public int Year { get; set; }
    public decimal TotalTithes { get; set; }
    public decimal TotalOfferings { get; set; }
    public decimal TotalDonations { get; set; }
    public string? DocumentUrl { get; set; }
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    public Core.Community Community { get; set; } = null!;
    public Core.User User { get; set; } = null!;
}
