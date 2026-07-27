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
public class CommunityController : ControllerBase
{
    private readonly ICommunityService _communityService;
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    public CommunityController(ICommunityService communityService)
    {
        _communityService = communityService;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<CommunityResponseDto>>> Create([FromBody] CreateCommunityRequestDto request)
    {
        var result = await _communityService.CreateCommunityAsync(request, UserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("search")]
    public async Task<ActionResult<ApiResponseDto<List<CommunityResponseDto>>>> Search([FromQuery] string? q)
    {
        return Ok(await _communityService.SearchCommunitiesAsync(q));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<CommunityResponseDto>>> GetById(Guid id)
    {
        return Ok(await _communityService.GetCommunityByIdAsync(id));
    }

    [HttpPost("join")]
    public async Task<ActionResult<ApiResponseDto<MembershipResponseDto>>> Join([FromBody] JoinCommunityRequestDto request)
    {
        var result = await _communityService.JoinCommunityAsync(request, UserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("membership/action")]
    public async Task<ActionResult<ApiResponseDto<bool>>> MembershipAction([FromBody] MembershipActionRequestDto request)
    {
        var result = await _communityService.HandleMembershipActionAsync(request, UserId);
        if (!result.Success)
        {
            if (result.ErrorCode == "PLAN_LIMIT_EXCEEDED") return StatusCode(403, result);
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("{communityId}/memberships/pending")]
    public async Task<ActionResult<ApiResponseDto<List<MembershipResponseDto>>>> GetPending(Guid communityId)
    {
        return Ok(await _communityService.GetPendingMembershipsAsync(communityId, UserId));
    }

    [HttpGet("{communityId}/members")]
    public async Task<ActionResult<ApiResponseDto<List<MembershipResponseDto>>>> GetMembers(Guid communityId)
    {
        return Ok(await _communityService.GetMembersAsync(communityId));
    }

    [HttpPost("leave")]
    public async Task<ActionResult<ApiResponseDto<MembershipResponseDto>>> Leave()
    {
        var result = await _communityService.LeaveCommunityAsync(UserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("{communityId}")]
    public async Task<ActionResult<ApiResponseDto<CommunityResponseDto>>> Update(Guid communityId, [FromBody] UpdateCommunityRequestDto request)
    {
        var result = await _communityService.UpdateCommunityAsync(communityId, request, UserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }
}
