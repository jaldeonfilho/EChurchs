using Echurchs.Models.Dtos.Request;
using Echurchs.Models.Dtos.Response;
using Echurchs.Models.Dtos.Shared;
using Echurchs.Models.Entities.Core;
using Echurchs.Models.Enums;
using Echurchs.Repository.Interfaces;
using Echurchs.Service.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Echurchs.Service.Implementation;

public class SubscriptionService : ISubscriptionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IStripeService _stripeService;
    private readonly IPlanLimitService _planLimitService;
    private readonly IConfiguration _configuration;

    public SubscriptionService(IUnitOfWork unitOfWork, IStripeService stripeService, IPlanLimitService planLimitService, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _stripeService = stripeService;
        _planLimitService = planLimitService;
        _configuration = configuration;
    }

    public async Task<ApiResponseDto<List<PlanResponseDto>>> GetPlansAsync()
    {
        var plans = (await _unitOfWork.Plans.FindAsync(p => p.IsActive)).OrderBy(p => p.Price).ToList();
        var limits = (await _unitOfWork.PlanLimits.GetAllAsync()).ToList();

        var result = plans.Select(p => new PlanResponseDto
        {
            Id = p.Id,
            Name = p.Name,
            Price = p.Price,
            PriceYearly = p.PriceYearly,
            Description = p.Description,
            Limits = limits.Where(l => l.PlanId == p.Id).Select(l => new PlanLimitDto
            {
                Module = l.Module,
                Feature = l.Feature,
                LimitValue = l.LimitValue,
                Description = l.Description
            }).ToList()
        }).ToList();

        return ApiResponseDto<List<PlanResponseDto>>.SuccessResponse(result);
    }

    public async Task<ApiResponseDto<PlanUsageResponseDto>> GetUsageAsync(Guid communityId)
    {
        var subscription = (await _unitOfWork.CommunitySubscriptions.FindAsync(s => s.CommunityId == communityId)).FirstOrDefault();
        if (subscription == null)
            return ApiResponseDto<PlanUsageResponseDto>.ErrorResponse("Esta comunidade não tem uma subscrição associada");

        var plan = await _unitOfWork.Plans.GetByIdAsync(subscription.PlanId);
        var items = await _planLimitService.GetUsageSummaryAsync(communityId);

        return ApiResponseDto<PlanUsageResponseDto>.SuccessResponse(new PlanUsageResponseDto
        {
            PlanId = subscription.PlanId,
            PlanName = plan?.Name ?? "Free",
            Status = subscription.Status.ToString(),
            BillingCycle = subscription.BillingCycle.ToString(),
            CurrentPeriodEnd = subscription.CurrentPeriodEnd,
            CancelAtPeriodEnd = subscription.CancelAtPeriodEnd,
            Items = items
        });
    }

    public async Task<ApiResponseDto<CheckoutSessionResponseDto>> CreateCheckoutSessionAsync(Guid communityId, Guid userId, CreateCheckoutSessionRequestDto request)
    {
        var plan = await _unitOfWork.Plans.GetByIdAsync(request.PlanId);
        if (plan == null || !plan.IsActive)
            return ApiResponseDto<CheckoutSessionResponseDto>.ErrorResponse("Plano não encontrado");

        var cycle = Enum.TryParse<BillingCycle>(request.BillingCycle, true, out var parsedCycle) ? parsedCycle : BillingCycle.Monthly;
        var priceId = cycle == BillingCycle.Yearly ? plan.StripePriceIdYearly : plan.StripePriceIdMonthly;
        if (string.IsNullOrEmpty(priceId))
            return ApiResponseDto<CheckoutSessionResponseDto>.ErrorResponse("Este plano ainda não está disponível para subscrição");

        var subscription = (await _unitOfWork.CommunitySubscriptions.FindAsync(s => s.CommunityId == communityId)).FirstOrDefault();
        if (subscription == null)
            return ApiResponseDto<CheckoutSessionResponseDto>.ErrorResponse("Esta comunidade não tem uma subscrição associada");

        if (string.IsNullOrEmpty(subscription.StripeCustomerId))
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            var customerId = await _stripeService.CreateCustomerAsync(user?.Email ?? "", user?.Name ?? "");
            subscription.StripeCustomerId = customerId;
            await _unitOfWork.CommunitySubscriptions.UpdateAsync(subscription);
            await _unitOfWork.SaveChangesAsync();
        }

        var metadata = new Dictionary<string, string>
        {
            { "communityId", communityId.ToString() },
            { "planId", plan.Id.ToString() },
            { "billingCycle", cycle.ToString() }
        };

        var checkoutUrl = await _stripeService.CreateCheckoutSessionUrlAsync(
            subscription.StripeCustomerId!,
            priceId,
            _configuration["Stripe:SuccessUrl"] ?? "",
            _configuration["Stripe:CancelUrl"] ?? "",
            metadata);

        return ApiResponseDto<CheckoutSessionResponseDto>.SuccessResponse(new CheckoutSessionResponseDto { CheckoutUrl = checkoutUrl });
    }

    public async Task<ApiResponseDto<PortalSessionResponseDto>> CreatePortalSessionAsync(Guid communityId)
    {
        var subscription = (await _unitOfWork.CommunitySubscriptions.FindAsync(s => s.CommunityId == communityId)).FirstOrDefault();
        if (subscription == null || string.IsNullOrEmpty(subscription.StripeCustomerId))
            return ApiResponseDto<PortalSessionResponseDto>.ErrorResponse("Esta comunidade ainda não tem uma subscrição paga associada");

        var portalUrl = await _stripeService.CreatePortalSessionUrlAsync(
            subscription.StripeCustomerId,
            _configuration["Stripe:PortalReturnUrl"] ?? _configuration["Stripe:SuccessUrl"] ?? "");

        return ApiResponseDto<PortalSessionResponseDto>.SuccessResponse(new PortalSessionResponseDto { PortalUrl = portalUrl });
    }

    public async Task HandleWebhookAsync(string json, string signatureHeader)
    {
        var webhookSecret = _configuration["Stripe:WebhookSecret"] ?? "";
        var stripeEvent = _stripeService.ConstructWebhookEvent(json, signatureHeader, webhookSecret);

        switch (stripeEvent.Type)
        {
            case "checkout.session.completed":
                await HandleCheckoutCompletedAsync(stripeEvent);
                break;
            case "customer.subscription.updated":
                await HandleSubscriptionUpdatedAsync(stripeEvent);
                break;
            case "customer.subscription.deleted":
                await HandleSubscriptionDeletedAsync(stripeEvent);
                break;
            case "invoice.payment_failed":
                await HandleInvoicePaymentFailedAsync(stripeEvent);
                break;
            case "invoice.payment_succeeded":
                await HandleInvoicePaymentSucceededAsync(stripeEvent);
                break;
        }
    }

    private async Task HandleCheckoutCompletedAsync(Stripe.Event stripeEvent)
    {
        if (stripeEvent.Data.Object is not Stripe.Checkout.Session session) return;
        if (session.Metadata == null || !session.Metadata.TryGetValue("communityId", out var communityIdStr)) return;
        if (!Guid.TryParse(communityIdStr, out var communityId)) return;
        if (!session.Metadata.TryGetValue("planId", out var planIdStr) || !Guid.TryParse(planIdStr, out var planId)) return;
        var cycle = session.Metadata.TryGetValue("billingCycle", out var cycleStr) && Enum.TryParse<BillingCycle>(cycleStr, true, out var parsed)
            ? parsed : BillingCycle.Monthly;

        var subscription = (await _unitOfWork.CommunitySubscriptions.FindAsync(s => s.CommunityId == communityId)).FirstOrDefault();
        if (subscription == null) return;

        subscription.PlanId = planId;
        subscription.BillingCycle = cycle;
        subscription.StripeCustomerId = session.CustomerId ?? subscription.StripeCustomerId;
        subscription.StripeSubscriptionId = session.SubscriptionId;
        subscription.Status = SubscriptionStatus.Active;
        subscription.StartDate = DateTime.UtcNow;

        await _unitOfWork.CommunitySubscriptions.UpdateAsync(subscription);
        await _unitOfWork.SaveChangesAsync();
    }

    private async Task HandleSubscriptionUpdatedAsync(Stripe.Event stripeEvent)
    {
        if (stripeEvent.Data.Object is not Stripe.Subscription sub) return;
        var subscription = (await _unitOfWork.CommunitySubscriptions.FindAsync(s => s.StripeSubscriptionId == sub.Id)).FirstOrDefault();
        if (subscription == null) return;

        subscription.Status = sub.Status switch
        {
            "active" => SubscriptionStatus.Active,
            "trialing" => SubscriptionStatus.Trial,
            "past_due" => SubscriptionStatus.PastDue,
            "unpaid" => SubscriptionStatus.PastDue,
            "canceled" => SubscriptionStatus.Cancelled,
            _ => subscription.Status
        };
        subscription.CurrentPeriodEnd = sub.CurrentPeriodEnd;
        subscription.CancelAtPeriodEnd = sub.CancelAtPeriodEnd;

        var priceId = sub.Items?.Data?.FirstOrDefault()?.Price?.Id;
        if (!string.IsNullOrEmpty(priceId))
        {
            var plan = (await _unitOfWork.Plans.FindAsync(p => p.StripePriceIdMonthly == priceId || p.StripePriceIdYearly == priceId)).FirstOrDefault();
            if (plan != null)
            {
                subscription.PlanId = plan.Id;
                subscription.BillingCycle = plan.StripePriceIdYearly == priceId ? BillingCycle.Yearly : BillingCycle.Monthly;
            }
        }

        await _unitOfWork.CommunitySubscriptions.UpdateAsync(subscription);
        await _unitOfWork.SaveChangesAsync();
    }

    private async Task HandleSubscriptionDeletedAsync(Stripe.Event stripeEvent)
    {
        if (stripeEvent.Data.Object is not Stripe.Subscription sub) return;
        var subscription = (await _unitOfWork.CommunitySubscriptions.FindAsync(s => s.StripeSubscriptionId == sub.Id)).FirstOrDefault();
        if (subscription == null) return;

        var freePlan = (await _unitOfWork.Plans.FindAsync(p => p.Name == "Free")).FirstOrDefault();
        if (freePlan != null) subscription.PlanId = freePlan.Id;

        subscription.Status = SubscriptionStatus.Active;
        subscription.BillingCycle = BillingCycle.Monthly;
        subscription.StripeSubscriptionId = null;
        subscription.CurrentPeriodEnd = null;
        subscription.CancelAtPeriodEnd = false;

        await _unitOfWork.CommunitySubscriptions.UpdateAsync(subscription);
        await _unitOfWork.SaveChangesAsync();
    }

    private async Task HandleInvoicePaymentFailedAsync(Stripe.Event stripeEvent)
    {
        if (stripeEvent.Data.Object is not Stripe.Invoice invoice || string.IsNullOrEmpty(invoice.CustomerId)) return;
        var subscription = (await _unitOfWork.CommunitySubscriptions.FindAsync(s => s.StripeCustomerId == invoice.CustomerId)).FirstOrDefault();
        if (subscription == null) return;

        subscription.Status = SubscriptionStatus.PastDue;
        await _unitOfWork.CommunitySubscriptions.UpdateAsync(subscription);
        await _unitOfWork.SaveChangesAsync();
    }

    private async Task HandleInvoicePaymentSucceededAsync(Stripe.Event stripeEvent)
    {
        if (stripeEvent.Data.Object is not Stripe.Invoice invoice || string.IsNullOrEmpty(invoice.CustomerId)) return;
        var subscription = (await _unitOfWork.CommunitySubscriptions.FindAsync(s => s.StripeCustomerId == invoice.CustomerId)).FirstOrDefault();
        if (subscription == null || subscription.Status != SubscriptionStatus.PastDue) return;

        subscription.Status = SubscriptionStatus.Active;
        await _unitOfWork.CommunitySubscriptions.UpdateAsync(subscription);
        await _unitOfWork.SaveChangesAsync();
    }
}
