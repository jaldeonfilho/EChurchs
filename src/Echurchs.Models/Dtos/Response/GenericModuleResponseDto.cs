namespace Echurchs.Models.Dtos.Response;

public class GenericModuleResponseDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public decimal? Amount { get; set; }
    public string? Content { get; set; }
    public string? FileUrl { get; set; }
    public string? ImageUrl { get; set; }
    public string? Location { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? ReferenceMonth { get; set; }
    public int? ReferenceYear { get; set; }
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public bool? IsPaid { get; set; }
    public DateTime? DueDate { get; set; }
    public string? ExpenseCategory { get; set; }
    public Dictionary<string, string>? Metadata { get; set; }
}
