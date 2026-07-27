using Echurchs.Models.Dtos.Request;
using Echurchs.Models.Dtos.Response;
using Echurchs.Models.Dtos.Shared;
using Echurchs.Models.Entities.Messaging;
using Echurchs.Repository.Interfaces;
using Echurchs.Service.Interfaces;

namespace Echurchs.Service.Implementation;

public class MessagingService : IMessagingService
{
    private readonly IUnitOfWork _unitOfWork;

    public MessagingService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponseDto<FriendshipResponseDto>> SendFriendRequestAsync(FriendRequestDto request, Guid userId)
    {
        if (request.AddresseeUserId == userId)
            return ApiResponseDto<FriendshipResponseDto>.ErrorResponse("Não pode adicionar a si mesmo");

        var existing = (await _unitOfWork.Friendships.FindAsync(
            f => (f.RequesterId == userId && f.AddresseeId == request.AddresseeUserId) ||
                 (f.RequesterId == request.AddresseeUserId && f.AddresseeId == userId))).FirstOrDefault();
        if (existing != null)
            return ApiResponseDto<FriendshipResponseDto>.ErrorResponse("Solicitação já existe");

        var friendship = new Friendship
        {
            Id = Guid.NewGuid(),
            RequesterId = userId,
            AddresseeId = request.AddresseeUserId,
            Status = Models.Enums.FriendshipStatus.Pending
        };

        await _unitOfWork.Friendships.AddAsync(friendship);
        await _unitOfWork.SaveChangesAsync();

        var user = await _unitOfWork.Users.GetByIdAsync(request.AddresseeUserId);

        return ApiResponseDto<FriendshipResponseDto>.SuccessResponse(new FriendshipResponseDto
        {
            Id = friendship.Id,
            OtherUserId = request.AddresseeUserId,
            OtherUserName = user?.Name ?? "",
            Status = friendship.Status.ToString(),
            CreatedAt = friendship.CreatedAt
        });
    }

    public async Task<ApiResponseDto<bool>> HandleFriendActionAsync(FriendActionRequestDto request, Guid userId)
    {
        var friendship = await _unitOfWork.Friendships.GetByIdAsync(request.FriendshipId);
        if (friendship == null)
            return ApiResponseDto<bool>.ErrorResponse("Solicitação não encontrada");

        if (friendship.AddresseeId != userId)
            return ApiResponseDto<bool>.ErrorResponse("Sem permissão");

        switch (request.Action.ToLower())
        {
            case "accept": friendship.Status = Models.Enums.FriendshipStatus.Accepted; break;
            case "reject": friendship.Status = Models.Enums.FriendshipStatus.Rejected; break;
            case "block": friendship.Status = Models.Enums.FriendshipStatus.Blocked; break;
            default: return ApiResponseDto<bool>.ErrorResponse("Ação inválida");
        }

        friendship.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();
        return ApiResponseDto<bool>.SuccessResponse(true);
    }

    public async Task<ApiResponseDto<List<FriendshipResponseDto>>> GetFriendsAsync(Guid userId)
    {
        var friendships = (await _unitOfWork.Friendships.FindAsync(
            f => (f.RequesterId == userId || f.AddresseeId == userId) && f.Status == Models.Enums.FriendshipStatus.Accepted)).ToList();

        var result = new List<FriendshipResponseDto>();
        foreach (var f in friendships)
        {
            var otherId = f.RequesterId == userId ? f.AddresseeId : f.RequesterId;
            var user = await _unitOfWork.Users.GetByIdAsync(otherId);
            result.Add(new FriendshipResponseDto
            {
                Id = f.Id, OtherUserId = otherId,
                OtherUserName = user?.Name ?? "", Status = f.Status.ToString(), CreatedAt = f.CreatedAt
            });
        }

        return ApiResponseDto<List<FriendshipResponseDto>>.SuccessResponse(result);
    }

    public async Task<ApiResponseDto<List<FriendshipResponseDto>>> GetPendingFriendRequestsAsync(Guid userId)
    {
        var friendships = (await _unitOfWork.Friendships.FindAsync(
            f => f.AddresseeId == userId && f.Status == Models.Enums.FriendshipStatus.Pending)).ToList();

        var result = new List<FriendshipResponseDto>();
        foreach (var f in friendships)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(f.RequesterId);
            result.Add(new FriendshipResponseDto
            {
                Id = f.Id, OtherUserId = f.RequesterId,
                OtherUserName = user?.Name ?? "", Status = f.Status.ToString(), CreatedAt = f.CreatedAt
            });
        }

        return ApiResponseDto<List<FriendshipResponseDto>>.SuccessResponse(result);
    }

    public async Task<ApiResponseDto<ConversationResponseDto>> StartConversationAsync(StartConversationRequestDto request, Guid userId)
    {
        if (request.RecipientUserId.HasValue)
        {
            var existing = (await _unitOfWork.ConversationParticipants.FindAsync(
                cp => cp.UserId == userId)).ToList();
            foreach (var cp in existing)
            {
                var conv = await _unitOfWork.Conversations.GetByIdAsync(cp.ConversationId);
                if (conv != null && !conv.IsGroup)
                {
                    var otherParticipant = (await _unitOfWork.ConversationParticipants.FindAsync(
                        p => p.ConversationId == conv.Id && p.UserId == request.RecipientUserId.Value)).FirstOrDefault();
                    if (otherParticipant != null)
                    {
                        return ApiResponseDto<ConversationResponseDto>.SuccessResponse(await MapConversationAsync(conv));
                    }
                }
            }

            var conversation = new Conversation { Id = Guid.NewGuid(), IsGroup = false };
            await _unitOfWork.Conversations.AddAsync(conversation);
            await _unitOfWork.ConversationParticipants.AddAsync(new ConversationParticipant { Id = Guid.NewGuid(), ConversationId = conversation.Id, UserId = userId });
            await _unitOfWork.ConversationParticipants.AddAsync(new ConversationParticipant { Id = Guid.NewGuid(), ConversationId = conversation.Id, UserId = request.RecipientUserId.Value });
            await _unitOfWork.SaveChangesAsync();
            return ApiResponseDto<ConversationResponseDto>.SuccessResponse(await MapConversationAsync(conversation));
        }

        var groupConv = new Conversation { Id = Guid.NewGuid(), IsGroup = true, Title = request.Title };
        await _unitOfWork.Conversations.AddAsync(groupConv);
        await _unitOfWork.ConversationParticipants.AddAsync(new ConversationParticipant { Id = Guid.NewGuid(), ConversationId = groupConv.Id, UserId = userId });
        if (request.ParticipantIds != null)
        {
            foreach (var pid in request.ParticipantIds)
                await _unitOfWork.ConversationParticipants.AddAsync(new ConversationParticipant { Id = Guid.NewGuid(), ConversationId = groupConv.Id, UserId = pid });
        }
        await _unitOfWork.SaveChangesAsync();
        return ApiResponseDto<ConversationResponseDto>.SuccessResponse(await MapConversationAsync(groupConv));
    }

    public async Task<ApiResponseDto<List<ConversationResponseDto>>> GetConversationsAsync(Guid userId)
    {
        var participantRecords = (await _unitOfWork.ConversationParticipants.FindAsync(cp => cp.UserId == userId && cp.LeftAt == null)).ToList();
        var result = new List<ConversationResponseDto>();

        foreach (var cp in participantRecords)
        {
            var conv = await _unitOfWork.Conversations.GetByIdAsync(cp.ConversationId);
            if (conv != null)
                result.Add(await MapConversationAsync(conv));
        }

        return ApiResponseDto<List<ConversationResponseDto>>.SuccessResponse(result);
    }

    public async Task<ApiResponseDto<ConversationResponseDto>> GetCommunityChatAsync(Guid communityId, Guid userId)
    {
        var membership = (await _unitOfWork.CommunityMemberships.FindAsync(
            m => m.CommunityId == communityId && m.UserId == userId && m.Status == Models.Enums.MembershipStatus.Active)).FirstOrDefault();
        if (membership == null)
            return ApiResponseDto<ConversationResponseDto>.ErrorResponse("Sem acesso");

        var allConv = (await _unitOfWork.ConversationParticipants.FindAsync(cp => cp.UserId == userId && cp.LeftAt == null)).ToList();
        var convIds = allConv.Select(cp => cp.ConversationId).ToList();
        var existing = (await _unitOfWork.Conversations.FindAsync(c => convIds.Contains(c.Id) && c.IsGroup && c.Title != null && c.Title.Contains("Chat Geral"))).FirstOrDefault();

        if (existing != null)
            return ApiResponseDto<ConversationResponseDto>.SuccessResponse(await MapConversationAsync(existing));

        var members = (await _unitOfWork.CommunityMemberships.FindAsync(
            m => m.CommunityId == communityId && m.Status == Models.Enums.MembershipStatus.Active)).ToList();
        var newConv = new Conversation { Id = Guid.NewGuid(), IsGroup = true, Title = "Chat Geral" };
        await _unitOfWork.Conversations.AddAsync(newConv);
        foreach (var m in members)
            await _unitOfWork.ConversationParticipants.AddAsync(new ConversationParticipant { Id = Guid.NewGuid(), ConversationId = newConv.Id, UserId = m.UserId });
        await _unitOfWork.SaveChangesAsync();
        return ApiResponseDto<ConversationResponseDto>.SuccessResponse(await MapConversationAsync(newConv));
    }

    public async Task<ApiResponseDto<bool>> DeleteMessageAsync(Guid messageId, Guid userId)
    {
        var message = await _unitOfWork.Messages.GetByIdAsync(messageId);
        if (message == null)
            return ApiResponseDto<bool>.ErrorResponse("Mensagem não encontrada");
        if (message.SenderId != userId)
            return ApiResponseDto<bool>.ErrorResponse("Sem permissão");

        await _unitOfWork.Messages.DeleteAsync(messageId);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponseDto<bool>.SuccessResponse(true);
    }

    public async Task<ApiResponseDto<List<MessageResponseDto>>> GetMessagesAsync(Guid conversationId, Guid userId)
    {
        var participant = (await _unitOfWork.ConversationParticipants.FindAsync(
            cp => cp.ConversationId == conversationId && cp.UserId == userId)).FirstOrDefault();
        if (participant == null)
            return ApiResponseDto<List<MessageResponseDto>>.ErrorResponse("Sem acesso");

        var messages = (await _unitOfWork.Messages.FindAsync(m => m.ConversationId == conversationId))
            .OrderBy(m => m.SentAt).Take(100).ToList();

        var result = new List<MessageResponseDto>();
        foreach (var m in messages)
        {
            var sender = await _unitOfWork.Users.GetByIdAsync(m.SenderId);
            result.Add(new MessageResponseDto
            {
                Id = m.Id, SenderId = m.SenderId,
                SenderName = sender?.Name ?? "", Content = m.Content,
                SentAt = m.SentAt, ReadAt = m.ReadAt
            });
        }

        return ApiResponseDto<List<MessageResponseDto>>.SuccessResponse(result);
    }

    public async Task<ApiResponseDto<MessageResponseDto>> SendMessageAsync(SendMessageRequestDto request, Guid userId)
    {
        var participant = (await _unitOfWork.ConversationParticipants.FindAsync(
            cp => cp.ConversationId == request.ConversationId && cp.UserId == userId)).FirstOrDefault();
        if (participant == null)
            return ApiResponseDto<MessageResponseDto>.ErrorResponse("Sem acesso");

        var message = new Message
        {
            Id = Guid.NewGuid(),
            ConversationId = request.ConversationId,
            SenderId = userId,
            Content = request.Content
        };

        await _unitOfWork.Messages.AddAsync(message);
        await _unitOfWork.SaveChangesAsync();

        var sender = await _unitOfWork.Users.GetByIdAsync(userId);

        return ApiResponseDto<MessageResponseDto>.SuccessResponse(new MessageResponseDto
        {
            Id = message.Id, SenderId = userId,
            SenderName = sender?.Name ?? "", Content = message.Content,
            SentAt = message.SentAt
        });
    }

    public async Task<ApiResponseDto<List<UserResponseDto>>> SearchUsersAsync(string search)
    {
        var users = (await _unitOfWork.Users.FindAsync(u => u.Name.Contains(search) || u.Email.Contains(search)))
            .Take(20).ToList();

        var result = users.Select(u => new UserResponseDto
        {
            Id = u.Id, Name = u.Name, Email = u.Email, ProfileImage = u.ProfileImage
        }).ToList();

        return ApiResponseDto<List<UserResponseDto>>.SuccessResponse(result);
    }

    private async Task<ConversationResponseDto> MapConversationAsync(Conversation conv)
    {
        var participants = (await _unitOfWork.ConversationParticipants.FindAsync(cp => cp.ConversationId == conv.Id)).ToList();
        var participantDtos = new List<ConversationParticipantDto>();
        foreach (var p in participants)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(p.UserId);
            participantDtos.Add(new ConversationParticipantDto
            {
                UserId = p.UserId, UserName = user?.Name ?? "", ProfileImage = user?.ProfileImage
            });
        }

        var lastMsg = (await _unitOfWork.Messages.FindAsync(m => m.ConversationId == conv.Id))
            .OrderByDescending(m => m.SentAt).FirstOrDefault();
        MessageResponseDto? lastMsgDto = null;
        if (lastMsg != null)
        {
            var sender = await _unitOfWork.Users.GetByIdAsync(lastMsg.SenderId);
            lastMsgDto = new MessageResponseDto
            {
                Id = lastMsg.Id, SenderId = lastMsg.SenderId,
                SenderName = sender?.Name ?? "", Content = lastMsg.Content, SentAt = lastMsg.SentAt
            };
        }

        return new ConversationResponseDto
        {
            Id = conv.Id, IsGroup = conv.IsGroup, Title = conv.Title,
            Participants = participantDtos, LastMessage = lastMsgDto
        };
    }
}
