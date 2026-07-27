using Echurchs.Models.Dtos.Request;
using Echurchs.Models.Dtos.Response;
using Echurchs.Models.Dtos.Shared;

namespace Echurchs.Service.Interfaces;

public interface ICommunityService
{
    Task<ApiResponseDto<CommunityResponseDto>> CreateCommunityAsync(CreateCommunityRequestDto request, Guid userId);
    Task<ApiResponseDto<CommunityResponseDto>> GetCommunityByIdAsync(Guid communityId);
    Task<ApiResponseDto<List<CommunityResponseDto>>> SearchCommunitiesAsync(string? search);
    Task<ApiResponseDto<MembershipResponseDto>> JoinCommunityAsync(JoinCommunityRequestDto request, Guid userId);
    Task<ApiResponseDto<bool>> HandleMembershipActionAsync(MembershipActionRequestDto request, Guid adminUserId);
    Task<ApiResponseDto<List<MembershipResponseDto>>> GetPendingMembershipsAsync(Guid communityId, Guid adminUserId);
    Task<ApiResponseDto<List<MembershipResponseDto>>> GetMembersAsync(Guid communityId);
    Task<ApiResponseDto<MembershipResponseDto>> LeaveCommunityAsync(Guid userId);
    Task<ApiResponseDto<CommunityResponseDto>> UpdateCommunityAsync(Guid communityId, UpdateCommunityRequestDto request, Guid userId);
}
