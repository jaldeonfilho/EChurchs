using Echurchs.Models.Dtos.Request;
using Echurchs.Models.Dtos.Response;
using Echurchs.Models.Dtos.Shared;

namespace Echurchs.Service.Interfaces;

public interface IFeedService
{
    Task<ApiResponseDto<FeedPageResponseDto>> GetFeedAsync(int skip, int take);
    Task<ApiResponseDto<FeedItemResponseDto>> CreatePostAsync(CreatePostRequestDto request, Guid userId);
}
