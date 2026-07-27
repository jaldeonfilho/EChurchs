using Echurchs.Models.Dtos.Request;
using Echurchs.Models.Dtos.Response;
using Echurchs.Models.Dtos.Shared;

namespace Echurchs.Service.Interfaces;

public interface IMessagingService
{
    Task<ApiResponseDto<FriendshipResponseDto>> SendFriendRequestAsync(FriendRequestDto request, Guid userId);
    Task<ApiResponseDto<bool>> HandleFriendActionAsync(FriendActionRequestDto request, Guid userId);
    Task<ApiResponseDto<List<FriendshipResponseDto>>> GetFriendsAsync(Guid userId);
    Task<ApiResponseDto<List<FriendshipResponseDto>>> GetPendingFriendRequestsAsync(Guid userId);
    Task<ApiResponseDto<ConversationResponseDto>> StartConversationAsync(StartConversationRequestDto request, Guid userId);
    Task<ApiResponseDto<List<ConversationResponseDto>>> GetConversationsAsync(Guid userId);
    Task<ApiResponseDto<ConversationResponseDto>> GetCommunityChatAsync(Guid communityId, Guid userId);
    Task<ApiResponseDto<List<MessageResponseDto>>> GetMessagesAsync(Guid conversationId, Guid userId);
    Task<ApiResponseDto<MessageResponseDto>> SendMessageAsync(SendMessageRequestDto request, Guid userId);
    Task<ApiResponseDto<bool>> DeleteMessageAsync(Guid messageId, Guid userId);
    Task<ApiResponseDto<List<UserResponseDto>>> SearchUsersAsync(string search);
}
