using Echurchs.Models.Dtos.Request;
using Echurchs.Models.Dtos.Response;
using Echurchs.Models.Dtos.Shared;

namespace Echurchs.Service.Interfaces;

public interface ICommunityModuleService
{
    Task<ApiResponseDto<List<GenericModuleResponseDto>>> GetAllAsync(Guid communityId, string module);
    Task<ApiResponseDto<GenericModuleResponseDto>> GetByIdAsync(Guid id, string module);
    Task<ApiResponseDto<GenericModuleResponseDto>> CreateAsync(GenericModuleRequestDto request, Guid communityId, Guid userId, string module);
    Task<ApiResponseDto<GenericModuleResponseDto>> UpdateAsync(Guid id, GenericModuleRequestDto request, Guid communityId, string module);
    Task<ApiResponseDto<bool>> DeleteAsync(Guid id, string module);
}
