namespace Echurchs.Models.Entities.Assets;

public class Asset
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CategoryId { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public decimal? PurchaseValue { get; set; }
    public decimal? CurrentValue { get; set; }
    public Echurchs.Models.Enums.AssetStatus Status { get; set; } = Echurchs.Models.Enums.AssetStatus.Active;
    public string? Location { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Core.Community Community { get; set; } = null!;
    public AssetCategory Category { get; set; } = null!;
}
