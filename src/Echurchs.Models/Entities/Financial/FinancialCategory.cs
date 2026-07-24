namespace Echurchs.Models.Entities.Financial;

public class FinancialCategory
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string Name { get; set; } = string.Empty;
    public Echurchs.Models.Enums.TransactionCategoryType Type { get; set; }
    public string? Description { get; set; }

    public Core.Community Community { get; set; } = null!;
    public ICollection<FinancialTransaction> Transactions { get; set; } = new List<FinancialTransaction>();
}
