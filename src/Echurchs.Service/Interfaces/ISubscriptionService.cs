using Echurchs.Models.Dtos.Request;
using Echurchs.Models.Dtos.Response;
using Echurchs.Models.Dtos.Shared;

namespace Echurchs.Service.Interfaces;

public interface ISubscriptionService
{
    Task<ApiResponseDto<List<PlanResponseDto>>> GetPlansAsync();
    Task<ApiResponseDto<PlanUsageResponseDto>> GetUsageAsync(Guid communityId);
    Task<ApiResponseDto<CheckoutSessionResponseDto>> CreateCheckoutSessionAsync(Guid communityId, Guid userId, CreateCheckoutSessionRequestDto request);
    Task<ApiResponseDto<PortalSessionResponseDto>> CreatePortalSessionAsync(Guid communityId);
    Task HandleWebhookAsync(string json, string signatureHeader);
}
