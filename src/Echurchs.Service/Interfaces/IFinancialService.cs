using Echurchs.Models.Dtos.Request;
using Echurchs.Models.Dtos.Response;
using Echurchs.Models.Dtos.Shared;

namespace Echurchs.Service.Interfaces;

public interface IFinancialService
{
    Task<ApiResponseDto<List<GenericModuleResponseDto>>> GetAllTransactionsAsync(Guid communityId, string? userId, bool isAdmin);
    Task<ApiResponseDto<GenericModuleResponseDto>> CreateTransactionAsync(GenericModuleRequestDto request, Guid communityId, Guid userId);
    Task<ApiResponseDto<GenericModuleResponseDto>> UpdateTransactionAsync(Guid id, GenericModuleRequestDto request, Guid communityId, Guid userId, bool isAdmin);
    Task<ApiResponseDto<bool>> DeleteTransactionAsync(Guid id, Guid communityId, Guid userId, bool isAdmin);
    Task<ApiResponseDto<List<GenericModuleResponseDto>>> GetPersonalDonationsAsync(Guid communityId, Guid userId);
}
