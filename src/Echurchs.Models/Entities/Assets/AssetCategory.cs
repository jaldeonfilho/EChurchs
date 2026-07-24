namespace Echurchs.Models.Entities.Assets;

public class AssetCategory
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public Core.Community Community { get; set; } = null!;
    public ICollection<Asset> Assets { get; set; } = new List<Asset>();
}
