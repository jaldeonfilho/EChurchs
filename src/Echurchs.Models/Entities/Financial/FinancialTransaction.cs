namespace Echurchs.Models.Entities.Financial;

public class FinancialTransaction
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public Guid? UserId { get; set; }
    public Guid? CategoryId { get; set; }
    public decimal Amount { get; set; }
    public DateTime TransactionDate { get; set; }
    public string? Description { get; set; }
    public Echurchs.Models.Enums.TransactionType Type { get; set; }
    public Echurchs.Models.Enums.PaymentMethod? PaymentMethod { get; set; }
    public string? AttachmentUrl { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Core.Community Community { get; set; } = null!;
    public Core.User? User { get; set; }
    public FinancialCategory? Category { get; set; }
    public Core.User Creator { get; set; } = null!;
}
