namespace Echurchs.Models.Entities.Messaging;

public class Friendship
{
    public Guid Id { get; set; }
    public Guid RequesterId { get; set; }
    public Guid AddresseeId { get; set; }
    public Echurchs.Models.Enums.FriendshipStatus Status { get; set; } = Echurchs.Models.Enums.FriendshipStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public Core.User Requester { get; set; } = null!;
    public Core.User Addressee { get; set; } = null!;
}
