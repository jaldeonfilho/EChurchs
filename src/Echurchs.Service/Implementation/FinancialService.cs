using Echurchs.Models.Dtos.Request;
using Echurchs.Models.Dtos.Response;
using Echurchs.Models.Dtos.Shared;
using Echurchs.Models.Entities.Financial;
using Echurchs.Repository.Interfaces;
using Echurchs.Service.Interfaces;

namespace Echurchs.Service.Implementation;

public class FinancialService : IFinancialService
{
    private readonly IUnitOfWork _unitOfWork;

    public FinancialService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponseDto<List<GenericModuleResponseDto>>> GetAllTransactionsAsync(Guid communityId, string? userId, bool isAdmin)
    {
        IEnumerable<FinancialTransaction> transactions;
        if (isAdmin)
        {
            transactions = (await _unitOfWork.FinancialTransactions.FindAsync(t => t.CommunityId == communityId)).ToList();
        }
        else if (!string.IsNullOrEmpty(userId) && Guid.TryParse(userId, out var uid))
        {
            transactions = (await _unitOfWork.FinancialTransactions.FindAsync(t => t.CommunityId == communityId && t.UserId == uid)).ToList();
        }
        else
        {
            transactions = new List<FinancialTransaction>();
        }

        var result = transactions.Select(t => new GenericModuleResponseDto
        {
            Id = t.Id, Title = t.Description ?? t.Type.ToString(),
            Amount = t.Amount, Content = t.Description,
            IsActive = true, CreatedAt = t.CreatedAt, StartDate = t.TransactionDate,
            Metadata = new Dictionary<string, string>
            {
                { "type", t.Type.ToString() },
                { "paymentMethod", t.PaymentMethod?.ToString() ?? "" },
                { "categoryName", t.Category?.Name ?? "" }
            }
        }).ToList();

        return ApiResponseDto<List<GenericModuleResponseDto>>.SuccessResponse(result);
    }

    public async Task<ApiResponseDto<GenericModuleResponseDto>> CreateTransactionAsync(GenericModuleRequestDto request, Guid communityId, Guid userId)
    {
        var transaction = new FinancialTransaction
        {
            Id = Guid.NewGuid(),
            CommunityId = communityId,
            UserId = Guid.TryParse(request.Metadata?.GetValueOrDefault("userId"), out var uid) ? uid : userId,
            CategoryId = request.CategoryId,
            Amount = request.Amount ?? 0,
            TransactionDate = request.StartDate ?? DateTime.UtcNow,
            Description = request.Description,
            Type = Enum.TryParse<Models.Enums.TransactionType>(request.Metadata?.GetValueOrDefault("type"), out var tt) ? tt : Models.Enums.TransactionType.Other,
            PaymentMethod = Enum.TryParse<Models.Enums.PaymentMethod>(request.Metadata?.GetValueOrDefault("paymentMethod"), out var pm) ? pm : null,
            CreatedBy = userId
        };

        await _unitOfWork.FinancialTransactions.AddAsync(transaction);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponseDto<GenericModuleResponseDto>.SuccessResponse(new GenericModuleResponseDto
        {
            Id = transaction.Id, Amount = transaction.Amount,
            Title = transaction.Description, IsActive = true, CreatedAt = transaction.CreatedAt
        });
    }

    public async Task<ApiResponseDto<GenericModuleResponseDto>> UpdateTransactionAsync(Guid id, GenericModuleRequestDto request, Guid communityId, Guid userId, bool isAdmin)
    {
        var transaction = await _unitOfWork.FinancialTransactions.GetByIdAsync(id);
        if (transaction == null || transaction.CommunityId != communityId)
            return ApiResponseDto<GenericModuleResponseDto>.ErrorResponse("Transação não encontrada");

        if (!isAdmin && transaction.UserId != userId)
            return ApiResponseDto<GenericModuleResponseDto>.ErrorResponse("Sem permissão");

        if (request.Amount.HasValue) transaction.Amount = request.Amount.Value;
        if (request.Description != null) transaction.Description = request.Description;
        if (request.StartDate.HasValue) transaction.TransactionDate = request.StartDate.Value;
        if (request.CategoryId.HasValue) transaction.CategoryId = request.CategoryId;
        if (request.Metadata != null)
        {
            if (request.Metadata.TryGetValue("type", out var typeStr) && Enum.TryParse<Models.Enums.TransactionType>(typeStr, out var tt))
                transaction.Type = tt;
            if (request.Metadata.TryGetValue("paymentMethod", out var pmStr) && Enum.TryParse<Models.Enums.PaymentMethod>(pmStr, out var pm))
                transaction.PaymentMethod = pm;
        }

        await _unitOfWork.SaveChangesAsync();
        return ApiResponseDto<GenericModuleResponseDto>.SuccessResponse(new GenericModuleResponseDto
        {
            Id = transaction.Id, Amount = transaction.Amount,
            Title = transaction.Description, IsActive = true, CreatedAt = transaction.CreatedAt
        });
    }

    public async Task<ApiResponseDto<bool>> DeleteTransactionAsync(Guid id, Guid communityId, Guid userId, bool isAdmin)
    {
        var transaction = await _unitOfWork.FinancialTransactions.GetByIdAsync(id);
        if (transaction == null || transaction.CommunityId != communityId)
            return ApiResponseDto<bool>.ErrorResponse("Transação não encontrada");

        if (!isAdmin && transaction.UserId != userId)
            return ApiResponseDto<bool>.ErrorResponse("Sem permissão");

        await _unitOfWork.FinancialTransactions.DeleteAsync(id);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponseDto<bool>.SuccessResponse(true);
    }

    public async Task<ApiResponseDto<List<GenericModuleResponseDto>>> GetPersonalDonationsAsync(Guid communityId, Guid userId)
    {
        var transactions = (await _unitOfWork.FinancialTransactions.FindAsync(
            t => t.CommunityId == communityId && t.UserId == userId)).ToList();

        var result = transactions.Select(t => new GenericModuleResponseDto
        {
            Id = t.Id, Title = t.Description ?? t.Type.ToString(),
            Amount = t.Amount, IsActive = true, CreatedAt = t.CreatedAt,
            StartDate = t.TransactionDate
        }).ToList();

        return ApiResponseDto<List<GenericModuleResponseDto>>.SuccessResponse(result);
    }
}
