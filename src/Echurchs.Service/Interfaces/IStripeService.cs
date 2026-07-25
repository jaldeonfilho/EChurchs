using Stripe;

namespace Echurchs.Service.Interfaces;

public interface IStripeService
{
    Task<string> CreateCustomerAsync(string email, string name);
    Task<string> CreateCheckoutSessionUrlAsync(string customerId, string priceId, string successUrl, string cancelUrl, Dictionary<string, string> metadata);
    Task<string> CreatePortalSessionUrlAsync(string customerId, string returnUrl);
    Event ConstructWebhookEvent(string json, string signatureHeader, string webhookSecret);
}
