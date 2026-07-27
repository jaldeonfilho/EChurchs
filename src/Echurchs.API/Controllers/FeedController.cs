using System.Security.Claims;
using Echurchs.Models.Dtos.Request;
using Echurchs.Models.Dtos.Response;
using Echurchs.Models.Dtos.Shared;
using Echurchs.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Echurchs.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FeedController : ControllerBase
{
    private readonly IFeedService _feedService;
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    public FeedController(IFeedService feedService)
    {
        _feedService = feedService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<FeedPageResponseDto>>> GetFeed([FromQuery] int skip = 0, [FromQuery] int take = 20)
    {
        return Ok(await _feedService.GetFeedAsync(skip, take));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<FeedItemResponseDto>>> CreatePost([FromBody] CreatePostRequestDto request)
    {
        var result = await _feedService.CreatePostAsync(request, UserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }
}
