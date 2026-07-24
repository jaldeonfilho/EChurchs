using Echurchs.Repository.Interfaces;

namespace Echurchs.API.Middleware;

public class CommunityMiddleware
{
    private readonly RequestDelegate _next;

    public CommunityMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var communityResolver = context.RequestServices.GetRequiredService<ICommunityResolver>();

        if (context.User.Identity?.IsAuthenticated == true)
        {
            var communityClaim = context.User.Claims.FirstOrDefault(c => c.Type == "CommunityId");
            if (communityClaim != null && Guid.TryParse(communityClaim.Value, out var communityId))
            {
                communityResolver.SetCurrentCommunityId(communityId);
            }
        }

        var headerCommunityId = context.Request.Headers["X-Community-Id"].FirstOrDefault();
        if (headerCommunityId != null && Guid.TryParse(headerCommunityId, out var headerCommunity))
        {
            communityResolver.SetCurrentCommunityId(headerCommunity);
        }

        await _next(context);
    }
}
