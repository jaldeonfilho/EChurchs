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

    public async Task<ApiResponseDto<List<GenericModuleResponseDto>>> GetAllTransactionsAsync(
        Guid communityId, string? userId, bool isAdmin,
        int? referenceMonth = null, int? referenceYear = null, string? filterUserId = null)
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

        if (referenceMonth.HasValue)
            transactions = transactions.Where(t => t.ReferenceMonth == referenceMonth.Value);
        if (referenceYear.HasValue)
            transactions = transactions.Where(t => t.ReferenceYear == referenceYear.Value);
        if (isAdmin && !string.IsNullOrEmpty(filterUserId) && Guid.TryParse(filterUserId, out var fuid))
            transactions = transactions.Where(t => t.UserId == fuid);

        var txList = transactions.ToList();

        var result = txList.Select(t => new GenericModuleResponseDto
        {
            Id = t.Id, Name = t.Type.ToString(), Title = t.Description ?? t.Type.ToString(),
            Amount = t.Amount, Content = t.Description, Description = t.Description,
            IsActive = true, CreatedAt = t.CreatedAt, StartDate = t.TransactionDate,
            ReferenceMonth = t.ReferenceMonth, ReferenceYear = t.ReferenceYear,
            UserId = t.UserId?.ToString(), UserName = null,
            IsPaid = t.IsPaid, DueDate = t.DueDate, ExpenseCategory = t.ExpenseCategory,
            Metadata = new Dictionary<string, string>
            {
                { "type", t.Type.ToString() },
                { "paymentMethod", t.PaymentMethod?.ToString() ?? "" },
                { "categoryName", t.Category?.Name ?? "" },
                { "paidStatus", t.IsPaid ? "S" : "N" },
                { "expenseCategory", t.ExpenseCategory ?? "" }
            }
        }).ToList();

        if (result.Any(r => r.UserId != null))
        {
            var userIds = result.Where(r => r.UserId != null)
                .Select(r => Guid.Parse(r.UserId!)).Distinct().ToList();
            var users = new List<Models.Entities.Core.User>();
            foreach (var id in userIds)
            {
                var u = await _unitOfWork.Users.GetByIdAsync(id);
                if (u != null) users.Add(u);
            }
            var userMap = users.ToDictionary(u => u.Id, u => u.Name);
            foreach (var r in result)
            {
                if (r.UserId != null && Guid.TryParse(r.UserId, out var uid) && userMap.TryGetValue(uid, out var name))
                    r.UserName = name;
            }
        }

        return ApiResponseDto<List<GenericModuleResponseDto>>.SuccessResponse(result);
    }

    public async Task<ApiResponseDto<GenericModuleResponseDto>> CreateTransactionAsync(GenericModuleRequestDto request, Guid communityId, Guid userId)
    {
        var now = DateTime.UtcNow;
        var refMonth = request.ReferenceMonth ?? now.Month;
        var refYear = request.ReferenceYear ?? now.Year;

        var transaction = new FinancialTransaction
        {
            Id = Guid.NewGuid(),
            CommunityId = communityId,
            UserId = Guid.TryParse(request.Metadata?.GetValueOrDefault("memberId"), out var uid) ? uid : 
                     Guid.TryParse(request.Metadata?.GetValueOrDefault("userId"), out var uid2) ? uid2 : userId,
            CategoryId = request.CategoryId,
            Amount = request.Amount ?? 0,
            TransactionDate = request.StartDate ?? DateTime.UtcNow,
            ReferenceMonth = refMonth,
            ReferenceYear = refYear,
            Description = request.Description,
            Type = Enum.TryParse<Models.Enums.TransactionType>(request.Metadata?.GetValueOrDefault("type"), out var tt) ? tt : Models.Enums.TransactionType.Other,
            PaymentMethod = Enum.TryParse<Models.Enums.PaymentMethod>(request.Metadata?.GetValueOrDefault("paymentMethod"), out var pm) ? pm : null,
            IsPaid = request.Metadata?.GetValueOrDefault("paidStatus") != "N",
            DueDate = request.DueDate,
            ExpenseCategory = request.ExpenseCategory ?? request.Metadata?.GetValueOrDefault("expenseCategory"),
            CreatedBy = userId
        };

        await _unitOfWork.FinancialTransactions.AddAsync(transaction);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponseDto<GenericModuleResponseDto>.SuccessResponse(new GenericModuleResponseDto
        {
            Id = transaction.Id, Amount = transaction.Amount,
            Title = transaction.Description, Description = transaction.Description, IsActive = true, CreatedAt = transaction.CreatedAt
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
        if (request.ReferenceMonth.HasValue) transaction.ReferenceMonth = request.ReferenceMonth.Value;
        if (request.ReferenceYear.HasValue) transaction.ReferenceYear = request.ReferenceYear.Value;
        if (request.DueDate.HasValue) transaction.DueDate = request.DueDate.Value;
        if (request.ExpenseCategory != null) transaction.ExpenseCategory = request.ExpenseCategory;
        if (request.CategoryId.HasValue) transaction.CategoryId = request.CategoryId;
        if (request.Metadata != null)
        {
            if (request.Metadata.TryGetValue("type", out var typeStr) && Enum.TryParse<Models.Enums.TransactionType>(typeStr, out var tt))
                transaction.Type = tt;
            if (request.Metadata.TryGetValue("paymentMethod", out var pmStr) && Enum.TryParse<Models.Enums.PaymentMethod>(pmStr, out var pm))
                transaction.PaymentMethod = pm;
            if (request.Metadata.TryGetValue("paidStatus", out var psStr))
                transaction.IsPaid = psStr != "N";
            if (request.Metadata.TryGetValue("expenseCategory", out var ecStr))
                transaction.ExpenseCategory = ecStr;
        }

        await _unitOfWork.SaveChangesAsync();
        return ApiResponseDto<GenericModuleResponseDto>.SuccessResponse(new GenericModuleResponseDto
        {
            Id = transaction.Id, Amount = transaction.Amount,
            Title = transaction.Description, Description = transaction.Description, IsActive = true, CreatedAt = transaction.CreatedAt
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
            Id = t.Id, Name = t.Type.ToString(), Title = t.Description ?? t.Type.ToString(),
            Amount = t.Amount, Description = t.Description, IsActive = true, CreatedAt = t.CreatedAt,
            StartDate = t.TransactionDate, ReferenceMonth = t.ReferenceMonth, ReferenceYear = t.ReferenceYear
        }).ToList();

        return ApiResponseDto<List<GenericModuleResponseDto>>.SuccessResponse(result);
    }
}
