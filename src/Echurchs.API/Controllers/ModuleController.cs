using System.Security.Claims;
using Echurchs.Models.Dtos.Request;
using Echurchs.Models.Dtos.Response;
using Echurchs.Models.Dtos.Shared;
using Echurchs.Repository.Interfaces;
using Echurchs.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Echurchs.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ModuleController : ControllerBase
{
    private readonly ICommunityModuleService _moduleService;
    private readonly IFinancialService _financialService;
    private readonly IUnitOfWork _unitOfWork;
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    public ModuleController(ICommunityModuleService moduleService, IFinancialService financialService, IUnitOfWork unitOfWork)
    {
        _moduleService = moduleService;
        _financialService = financialService;
        _unitOfWork = unitOfWork;
    }

    [HttpGet("{communityId}/{module}")]
    public async Task<ActionResult<ApiResponseDto<List<GenericModuleResponseDto>>>> GetAll(
        Guid communityId, string module,
        [FromQuery] int? referenceMonth = null,
        [FromQuery] int? referenceYear = null,
        [FromQuery] string? filterUserId = null)
    {
        if (module.ToLower() == "financial")
        {
            var isAdmin = await IsAdminOrFinancialManager(UserId, communityId);
            return Ok(await _financialService.GetAllTransactionsAsync(communityId, UserId.ToString(), isAdmin, referenceMonth, referenceYear, filterUserId));
        }
        return Ok(await _moduleService.GetAllAsync(communityId, module));
    }

    [HttpGet("{communityId}/{module}/{id:guid}")]
    public async Task<ActionResult<ApiResponseDto<GenericModuleResponseDto>>> GetById(Guid communityId, string module, Guid id)
    {
        return Ok(await _moduleService.GetByIdAsync(id, module));
    }

    [HttpPost("{communityId}/{module}")]
    public async Task<ActionResult<ApiResponseDto<GenericModuleResponseDto>>> Create(Guid communityId, string module, [FromBody] GenericModuleRequestDto request)
    {
        var result = await _moduleService.CreateAsync(request, communityId, UserId, module);
        if (!result.Success)
        {
            if (result.ErrorCode == "PLAN_LIMIT_EXCEEDED") return StatusCode(403, result);
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPut("{communityId}/{module}/{id}")]
    public async Task<ActionResult<ApiResponseDto<GenericModuleResponseDto>>> Update(Guid communityId, string module, Guid id, [FromBody] GenericModuleRequestDto request)
    {
        var result = await _moduleService.UpdateAsync(id, request, communityId, module);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{module}/{id}")]
    public async Task<ActionResult<ApiResponseDto<bool>>> Delete(string module, Guid id)
    {
        var result = await _moduleService.DeleteAsync(id, module);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("{communityId}/personal/donations")]
    public async Task<ActionResult<ApiResponseDto<List<GenericModuleResponseDto>>>> GetPersonalDonations(Guid communityId)
    {
        return Ok(await _financialService.GetPersonalDonationsAsync(communityId, UserId));
    }

    [HttpGet("{communityId}/members/list")]
    public async Task<ActionResult<ApiResponseDto<List<MembershipResponseDto>>>> GetMembersList(Guid communityId)
    {
        var isAdmin = await IsAdminOrFinancialManager(UserId, communityId);
        if (!isAdmin) return Forbid();

        var memberships = (await _unitOfWork.CommunityMemberships.FindAsync(
            m => m.CommunityId == communityId && m.Status == Models.Enums.MembershipStatus.Active)).ToList();

        var result = new List<MembershipResponseDto>();
        foreach (var m in memberships)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(m.UserId);
            result.Add(new MembershipResponseDto
            {
                Id = m.Id,
                UserId = m.UserId,
                UserName = user?.Name ?? string.Empty,
                UserEmail = user?.Email,
                Role = m.Role.ToString(),
                Status = m.Status.ToString(),
                CreatedAt = m.CreatedAt
            });
        }

        return Ok(ApiResponseDto<List<MembershipResponseDto>>.SuccessResponse(result));
    }

    [HttpPost("{communityId}/financial/transaction")]
    public async Task<ActionResult<ApiResponseDto<GenericModuleResponseDto>>> CreateTransaction(Guid communityId, [FromBody] GenericModuleRequestDto request)
    {
        var isAdmin = await IsAdminOrFinancialManager(UserId, communityId);
        if (!isAdmin) return Forbid();
        var result = await _financialService.CreateTransactionAsync(request, communityId, UserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("{communityId}/financial/transaction/{id}")]
    public async Task<ActionResult<ApiResponseDto<GenericModuleResponseDto>>> UpdateTransaction(Guid communityId, Guid id, [FromBody] GenericModuleRequestDto request)
    {
        var isAdmin = await IsAdminOrFinancialManager(UserId, communityId);
        var result = await _financialService.UpdateTransactionAsync(id, request, communityId, UserId, isAdmin);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{communityId}/financial/transaction/{id}")]
    public async Task<ActionResult<ApiResponseDto<bool>>> DeleteTransaction(Guid communityId, Guid id)
    {
        var isAdmin = await IsAdminOrFinancialManager(UserId, communityId);
        var result = await _financialService.DeleteTransactionAsync(id, communityId, UserId, isAdmin);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    private async Task<bool> IsAdminOrFinancialManager(Guid userId, Guid communityId)
    {
        var membership = (await _unitOfWork.CommunityMemberships.FindAsync(
            m => m.UserId == userId && m.CommunityId == communityId && m.Status == Models.Enums.MembershipStatus.Active)).FirstOrDefault();
        return membership != null && (membership.Role == Models.Enums.CommunityRole.Admin || membership.Role == Models.Enums.CommunityRole.FinancialManager);
    }
}
