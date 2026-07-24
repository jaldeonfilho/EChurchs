namespace Echurchs.Models.Entities.Donations;

public class Donation
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public Guid? UserId { get; set; }
    public string DonorName { get; set; } = string.Empty;
    public string? DonorEmail { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? ExternalPaymentId { get; set; }
    public Echurchs.Models.Enums.DonationStatus Status { get; set; } = Echurchs.Models.Enums.DonationStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Core.Community Community { get; set; } = null!;
    public Core.User? User { get; set; }
}
