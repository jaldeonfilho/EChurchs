using Echurchs.Models.Dtos.Request;
using Echurchs.Models.Dtos.Response;
using Echurchs.Models.Dtos.Shared;
using Echurchs.Models.Entities.Feed;
using Echurchs.Models.Enums;
using Echurchs.Repository.Interfaces;
using Echurchs.Service.Interfaces;

namespace Echurchs.Service.Implementation;

public class FeedService : IFeedService
{
    private readonly IUnitOfWork _unitOfWork;

    public FeedService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponseDto<FeedPageResponseDto>> GetFeedAsync(int skip, int take)
    {
        var posts = (await _unitOfWork.Posts.FindAsync(_ => true)).ToList();
        var events = (await _unitOfWork.CalendarEvents.FindAsync(_ => true)).ToList();

        var authorIds = posts.Select(p => p.AuthorId)
            .Concat(events.Select(e => e.CreatedBy))
            .Distinct()
            .ToList();
        var users = (await _unitOfWork.Users.FindAsync(u => authorIds.Contains(u.Id)))
            .ToDictionary(u => u.Id);

        var activeMemberships = (await _unitOfWork.CommunityMemberships.FindAsync(
                m => authorIds.Contains(m.UserId) && m.Status == MembershipStatus.Active))
            .GroupBy(m => m.UserId)
            .ToDictionary(g => g.Key, g => g.First());

        var communityIds = activeMemberships.Values.Select(m => m.CommunityId)
            .Concat(events.Select(e => e.CommunityId))
            .Distinct()
            .ToList();
        var communities = (await _unitOfWork.Communities.FindAsync(c => communityIds.Contains(c.Id)))
            .ToDictionary(c => c.Id);

        var items = new List<FeedItemResponseDto>();

        foreach (var post in posts)
        {
            users.TryGetValue(post.AuthorId, out var author);
            Models.Entities.Core.Community? community = null;
            if (activeMemberships.TryGetValue(post.AuthorId, out var membership))
                communities.TryGetValue(membership.CommunityId, out community);

            items.Add(new FeedItemResponseDto
            {
                Id = post.Id,
                Source = "Post",
                PostType = post.Type.ToString(),
                AuthorId = post.AuthorId,
                AuthorName = author?.Name ?? string.Empty,
                AuthorProfileImage = author?.ProfileImage,
                CommunityId = community?.Id,
                CommunityName = community?.Name,
                CommunityLogoUrl = community?.LogoUrl,
                Content = post.Content,
                MediaUrl = post.MediaUrl,
                LiveUrl = post.LiveUrl,
                EventTitle = post.EventTitle,
                EventDate = post.EventDate,
                EventEndDate = post.EventEndDate,
                EventLocation = post.EventLocation,
                CreatedAt = post.CreatedAt
            });
        }

        foreach (var calendarEvent in events)
        {
            users.TryGetValue(calendarEvent.CreatedBy, out var author);
            communities.TryGetValue(calendarEvent.CommunityId, out var community);

            items.Add(new FeedItemResponseDto
            {
                Id = calendarEvent.Id,
                Source = "CalendarEvent",
                AuthorId = calendarEvent.CreatedBy,
                AuthorName = author?.Name ?? string.Empty,
                AuthorProfileImage = author?.ProfileImage,
                CommunityId = community?.Id,
                CommunityName = community?.Name,
                CommunityLogoUrl = community?.LogoUrl,
                Content = calendarEvent.Description,
                EventTitle = calendarEvent.Title,
                EventDate = calendarEvent.StartDate,
                EventEndDate = calendarEvent.EndDate,
                EventLocation = calendarEvent.Location,
                CreatedAt = calendarEvent.CreatedAt
            });
        }

        var ordered = items.OrderByDescending(i => i.CreatedAt).ToList();
        var page = ordered.Skip(skip).Take(take).ToList();

        return ApiResponseDto<FeedPageResponseDto>.SuccessResponse(new FeedPageResponseDto
        {
            Items = page,
            HasMore = ordered.Count > skip + take
        });
    }

    public async Task<ApiResponseDto<FeedItemResponseDto>> CreatePostAsync(CreatePostRequestDto request, Guid userId)
    {
        switch (request.Type)
        {
            case PostType.Live when string.IsNullOrWhiteSpace(request.LiveUrl):
                return ApiResponseDto<FeedItemResponseDto>.ErrorResponse("O link da transmissão é obrigatório");
            case PostType.Media when string.IsNullOrWhiteSpace(request.MediaUrl):
                return ApiResponseDto<FeedItemResponseDto>.ErrorResponse("A foto/vídeo é obrigatória");
            case PostType.Event when string.IsNullOrWhiteSpace(request.EventTitle) || request.EventDate == null:
                return ApiResponseDto<FeedItemResponseDto>.ErrorResponse("Título e data do evento são obrigatórios");
        }

        var post = new Post
        {
            Id = Guid.NewGuid(),
            AuthorId = userId,
            Type = request.Type,
            Content = request.Content,
            MediaUrl = request.MediaUrl,
            LiveUrl = request.LiveUrl,
            EventTitle = request.EventTitle,
            EventDate = request.EventDate,
            EventEndDate = request.EventEndDate,
            EventLocation = request.EventLocation
        };

        await _unitOfWork.Posts.AddAsync(post);
        await _unitOfWork.SaveChangesAsync();

        var author = await _unitOfWork.Users.GetByIdAsync(userId);
        var membership = (await _unitOfWork.CommunityMemberships.FindAsync(
            m => m.UserId == userId && m.Status == MembershipStatus.Active)).FirstOrDefault();
        var community = membership != null ? await _unitOfWork.Communities.GetByIdAsync(membership.CommunityId) : null;

        return ApiResponseDto<FeedItemResponseDto>.SuccessResponse(new FeedItemResponseDto
        {
            Id = post.Id,
            Source = "Post",
            PostType = post.Type.ToString(),
            AuthorId = post.AuthorId,
            AuthorName = author?.Name ?? string.Empty,
            AuthorProfileImage = author?.ProfileImage,
            CommunityId = community?.Id,
            CommunityName = community?.Name,
            CommunityLogoUrl = community?.LogoUrl,
            Content = post.Content,
            MediaUrl = post.MediaUrl,
            LiveUrl = post.LiveUrl,
            EventTitle = post.EventTitle,
            EventDate = post.EventDate,
            EventEndDate = post.EventEndDate,
            EventLocation = post.EventLocation,
            CreatedAt = post.CreatedAt
        });
    }
}
