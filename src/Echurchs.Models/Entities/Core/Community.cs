namespace Echurchs.Models.Entities.Core;

public class Community
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Nipc { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? LogoUrl { get; set; }
    public string? Slug { get; set; }
    public Guid CreatedBy { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User Creator { get; set; } = null!;
    public CommunitySubscription? Subscription { get; set; }
    public ICollection<CommunityMembership> Memberships { get; set; } = new List<CommunityMembership>();
}
