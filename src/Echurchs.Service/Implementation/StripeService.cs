using Echurchs.Service.Interfaces;
using Stripe;
using Stripe.Checkout;

namespace Echurchs.Service.Implementation;

public class StripeService : IStripeService
{
    public async Task<string> CreateCustomerAsync(string email, string name)
    {
        var service = new CustomerService();
        var customer = await service.CreateAsync(new CustomerCreateOptions
        {
            Email = email,
            Name = name
        });
        return customer.Id;
    }

    public async Task<string> CreateCheckoutSessionUrlAsync(string customerId, string priceId, string successUrl, string cancelUrl, Dictionary<string, string> metadata)
    {
        var options = new SessionCreateOptions
        {
            Mode = "subscription",
            Customer = customerId,
            LineItems = new List<SessionLineItemOptions>
            {
                new() { Price = priceId, Quantity = 1 }
            },
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            Metadata = metadata
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options);
        return session.Url;
    }

    public async Task<string> CreatePortalSessionUrlAsync(string customerId, string returnUrl)
    {
        var options = new Stripe.BillingPortal.SessionCreateOptions
        {
            Customer = customerId,
            ReturnUrl = returnUrl
        };

        var service = new Stripe.BillingPortal.SessionService();
        var session = await service.CreateAsync(options);
        return session.Url;
    }

    public Event ConstructWebhookEvent(string json, string signatureHeader, string webhookSecret)
    {
        return EventUtility.ConstructEvent(json, signatureHeader, webhookSecret);
    }
}
