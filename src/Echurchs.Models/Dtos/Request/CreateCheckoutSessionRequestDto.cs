namespace Echurchs.Models.Dtos.Request;

public class CreateCheckoutSessionRequestDto
{
    public Guid PlanId { get; set; }
    public string BillingCycle { get; set; } = "Monthly";
}
