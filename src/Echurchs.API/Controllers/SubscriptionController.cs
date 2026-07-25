using System.Security.Claims;
using System.Text;
using Echurchs.Models.Dtos.Request;
using Echurchs.Models.Dtos.Response;
using Echurchs.Models.Dtos.Shared;
using Echurchs.Repository.Interfaces;
using Echurchs.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Echurchs.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubscriptionController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;
    private readonly IUnitOfWork _unitOfWork;
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    public SubscriptionController(ISubscriptionService subscriptionService, IUnitOfWork unitOfWork)
    {
        _subscriptionService = subscriptionService;
        _unitOfWork = unitOfWork;
    }

    [HttpGet("plans")]
    public async Task<ActionResult<ApiResponseDto<List<PlanResponseDto>>>> GetPlans()
    {
        return Ok(await _subscriptionService.GetPlansAsync());
    }

    [HttpGet("{communityId}/usage")]
    public async Task<ActionResult<ApiResponseDto<PlanUsageResponseDto>>> GetUsage(Guid communityId)
    {
        if (!await IsAdminOrFinancialManager(UserId, communityId)) return Forbid();
        var result = await _subscriptionService.GetUsageAsync(communityId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("{communityId}/checkout-session")]
    public async Task<ActionResult<ApiResponseDto<CheckoutSessionResponseDto>>> CreateCheckoutSession(Guid communityId, [FromBody] CreateCheckoutSessionRequestDto request)
    {
        if (!await IsAdminOrFinancialManager(UserId, communityId)) return Forbid();
        var result = await _subscriptionService.CreateCheckoutSessionAsync(communityId, UserId, request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("{communityId}/portal-session")]
    public async Task<ActionResult<ApiResponseDto<PortalSessionResponseDto>>> CreatePortalSession(Guid communityId)
    {
        if (!await IsAdminOrFinancialManager(UserId, communityId)) return Forbid();
        var result = await _subscriptionService.CreatePortalSessionAsync(communityId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook()
    {
        using var reader = new StreamReader(Request.Body, Encoding.UTF8);
        var json = await reader.ReadToEndAsync();
        var signature = Request.Headers["Stripe-Signature"].ToString();

        try
        {
            await _subscriptionService.HandleWebhookAsync(json, signature);
            return Ok();
        }
        catch (Stripe.StripeException)
        {
            return BadRequest();
        }
    }

    private async Task<bool> IsAdminOrFinancialManager(Guid userId, Guid communityId)
    {
        var membership = (await _unitOfWork.CommunityMemberships.FindAsync(
            m => m.UserId == userId && m.CommunityId == communityId && m.Status == Models.Enums.MembershipStatus.Active)).FirstOrDefault();
        return membership != null && (membership.Role == Models.Enums.CommunityRole.Admin || membership.Role == Models.Enums.CommunityRole.FinancialManager);
    }
}
