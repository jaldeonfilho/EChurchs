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
public class MessagingController : ControllerBase
{
    private readonly IMessagingService _messagingService;
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    public MessagingController(IMessagingService messagingService)
    {
        _messagingService = messagingService;
    }

    [HttpPost("friend-request")]
    public async Task<ActionResult<ApiResponseDto<FriendshipResponseDto>>> SendFriendRequest([FromBody] FriendRequestDto request)
    {
        var result = await _messagingService.SendFriendRequestAsync(request, UserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("friend/action")]
    public async Task<ActionResult<ApiResponseDto<bool>>> FriendAction([FromBody] FriendActionRequestDto request)
    {
        var result = await _messagingService.HandleFriendActionAsync(request, UserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("friends")]
    public async Task<ActionResult<ApiResponseDto<List<FriendshipResponseDto>>>> GetFriends()
    {
        return Ok(await _messagingService.GetFriendsAsync(UserId));
    }

    [HttpGet("friends/pending")]
    public async Task<ActionResult<ApiResponseDto<List<FriendshipResponseDto>>>> GetPendingFriends()
    {
        return Ok(await _messagingService.GetPendingFriendRequestsAsync(UserId));
    }

    [HttpPost("conversation")]
    public async Task<ActionResult<ApiResponseDto<ConversationResponseDto>>> StartConversation([FromBody] StartConversationRequestDto request)
    {
        return Ok(await _messagingService.StartConversationAsync(request, UserId));
    }

    [HttpGet("conversations")]
    public async Task<ActionResult<ApiResponseDto<List<ConversationResponseDto>>>> GetConversations()
    {
        return Ok(await _messagingService.GetConversationsAsync(UserId));
    }

    [HttpGet("conversation/{conversationId}/messages")]
    public async Task<ActionResult<ApiResponseDto<List<MessageResponseDto>>>> GetMessages(Guid conversationId)
    {
        return Ok(await _messagingService.GetMessagesAsync(conversationId, UserId));
    }

    [HttpPost("message")]
    public async Task<ActionResult<ApiResponseDto<MessageResponseDto>>> SendMessage([FromBody] SendMessageRequestDto request)
    {
        var result = await _messagingService.SendMessageAsync(request, UserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("users/search")]
    public async Task<ActionResult<ApiResponseDto<List<UserResponseDto>>>> SearchUsers([FromQuery] string q)
    {
        return Ok(await _messagingService.SearchUsersAsync(q));
    }
}
