namespace Echurchs.Models.Entities.Donations;

public class PaymentGatewayConfig
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public Echurchs.Models.Enums.PaymentGatewayProvider Provider { get; set; }
    public string PublicKey { get; set; } = string.Empty;
    public string EncryptedSecretKey { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Core.Community Community { get; set; } = null!;
}
