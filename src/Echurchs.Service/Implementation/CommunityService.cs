using Echurchs.Models.Dtos.Request;
using Echurchs.Models.Dtos.Response;
using Echurchs.Models.Dtos.Shared;
using Echurchs.Models.Entities.Core;
using Echurchs.Repository.Interfaces;
using Echurchs.Service.Interfaces;

namespace Echurchs.Service.Implementation;

public class CommunityService : ICommunityService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPlanLimitService _planLimitService;

    public CommunityService(IUnitOfWork unitOfWork, IPlanLimitService planLimitService)
    {
        _unitOfWork = unitOfWork;
        _planLimitService = planLimitService;
    }

    public async Task<ApiResponseDto<CommunityResponseDto>> CreateCommunityAsync(CreateCommunityRequestDto request, Guid userId)
    {
        var existingMembership = (await _unitOfWork.CommunityMemberships.FindAsync(
            m => m.UserId == userId && m.Status == Models.Enums.MembershipStatus.Active)).FirstOrDefault();
        if (existingMembership != null)
            return ApiResponseDto<CommunityResponseDto>.ErrorResponse("Você já pertence a uma comunidade");

        var community = new Community
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Nipc = request.Nipc,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address,
            CreatedBy = userId,
            Slug = request.Name.ToLower().Replace(" ", "-").Replace(".", "").Replace(",", "")
        };

        await _unitOfWork.Communities.AddAsync(community);

        var freePlan = (await _unitOfWork.Plans.FindAsync(p => p.Name == "Free")).FirstOrDefault();
        if (freePlan != null)
        {
            var subscription = new CommunitySubscription
            {
                Id = Guid.NewGuid(),
                CommunityId = community.Id,
                PlanId = freePlan.Id,
                StartDate = DateTime.UtcNow,
                Status = Models.Enums.SubscriptionStatus.Active
            };
            await _unitOfWork.CommunitySubscriptions.AddAsync(subscription);
        }

        var membership = new CommunityMembership
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CommunityId = community.Id,
            Role = Models.Enums.CommunityRole.Admin,
            Status = Models.Enums.MembershipStatus.Active,
            JoinedAt = DateTime.UtcNow
        };
        await _unitOfWork.CommunityMemberships.AddAsync(membership);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponseDto<CommunityResponseDto>.SuccessResponse(new CommunityResponseDto
        {
            Id = community.Id,
            Name = community.Name,
            Description = community.Description,
            Slug = community.Slug,
            MemberCount = 1,
            PlanName = freePlan?.Name,
            CreatedAt = community.CreatedAt
        });
    }

    public async Task<ApiResponseDto<CommunityResponseDto>> GetCommunityByIdAsync(Guid communityId)
    {
        var community = await _unitOfWork.Communities.GetByIdAsync(communityId);
        if (community == null)
            return ApiResponseDto<CommunityResponseDto>.ErrorResponse("Comunidade não encontrada");

        var memberCount = (await _unitOfWork.CommunityMemberships.FindAsync(
            m => m.CommunityId == communityId && m.Status == Models.Enums.MembershipStatus.Active)).Count();

        var subscription = (await _unitOfWork.CommunitySubscriptions.FindAsync(
            s => s.CommunityId == communityId && s.Status == Models.Enums.SubscriptionStatus.Active)).FirstOrDefault();

        return ApiResponseDto<CommunityResponseDto>.SuccessResponse(new CommunityResponseDto
        {
            Id = community.Id,
            Name = community.Name,
            Description = community.Description,
            LogoUrl = community.LogoUrl,
            Slug = community.Slug,
            MemberCount = memberCount,
            PlanName = subscription?.Plan?.Name,
            CreatedAt = community.CreatedAt
        });
    }

    public async Task<ApiResponseDto<List<CommunityResponseDto>>> SearchCommunitiesAsync(string? search)
    {
        var query = await _unitOfWork.Communities.FindAsync(c => c.IsActive);
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => c.Name.Contains(search) || (c.Slug != null && c.Slug.Contains(search.ToLower())));
        }

        var communities = query.Take(20).ToList();
        var result = new List<CommunityResponseDto>();

        foreach (var c in communities)
        {
            var memberCount = (await _unitOfWork.CommunityMemberships.FindAsync(
                m => m.CommunityId == c.Id && m.Status == Models.Enums.MembershipStatus.Active)).Count();
            result.Add(new CommunityResponseDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                LogoUrl = c.LogoUrl,
                Slug = c.Slug,
                MemberCount = memberCount,
                CreatedAt = c.CreatedAt
            });
        }

        return ApiResponseDto<List<CommunityResponseDto>>.SuccessResponse(result);
    }

    public async Task<ApiResponseDto<MembershipResponseDto>> JoinCommunityAsync(JoinCommunityRequestDto request, Guid userId)
    {
        var community = await _unitOfWork.Communities.GetByIdAsync(request.CommunityId);
        if (community == null)
            return ApiResponseDto<MembershipResponseDto>.ErrorResponse("Comunidade não encontrada");

        var existing = (await _unitOfWork.CommunityMemberships.FindAsync(
            m => m.UserId == userId && m.CommunityId == request.CommunityId)).FirstOrDefault();
        if (existing != null)
            return ApiResponseDto<MembershipResponseDto>.ErrorResponse("Você já tem um vínculo com esta comunidade");

        var membership = new CommunityMembership
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CommunityId = request.CommunityId,
            Role = Models.Enums.CommunityRole.Member,
            Status = Models.Enums.MembershipStatus.Pending
        };

        await _unitOfWork.CommunityMemberships.AddAsync(membership);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponseDto<MembershipResponseDto>.SuccessResponse(new MembershipResponseDto
        {
            Id = membership.Id,
            CommunityId = community.Id,
            CommunityName = community.Name,
            Role = membership.Role.ToString(),
            Status = membership.Status.ToString(),
            CreatedAt = membership.CreatedAt
        });
    }

    public async Task<ApiResponseDto<bool>> HandleMembershipActionAsync(MembershipActionRequestDto request, Guid adminUserId)
    {
        var membership = await _unitOfWork.CommunityMemberships.GetByIdAsync(request.MembershipId);
        if (membership == null)
            return ApiResponseDto<bool>.ErrorResponse("Membros não encontrados");

        var adminMembership = (await _unitOfWork.CommunityMemberships.FindAsync(
            m => m.UserId == adminUserId && m.CommunityId == membership.CommunityId && m.Status == Models.Enums.MembershipStatus.Active)).FirstOrDefault();
        if (adminMembership == null || (adminMembership.Role != Models.Enums.CommunityRole.Admin && adminMembership.Role != Models.Enums.CommunityRole.Leader))
            return ApiResponseDto<bool>.ErrorResponse("Sem permissão");

        switch (request.Action.ToLower())
        {
            case "approve":
                var limitCheck = await _planLimitService.CheckLimitAsync(membership.CommunityId, "Pessoas", "MaxMembers");
                if (!limitCheck.Allowed)
                    return ApiResponseDto<bool>.ErrorResponse(
                        $"Limite do plano {limitCheck.PlanName} atingido ({limitCheck.CurrentUsage}/{limitCheck.LimitValue}). Faça upgrade para continuar.",
                        errorCode: "PLAN_LIMIT_EXCEEDED");
                membership.Status = Models.Enums.MembershipStatus.Active;
                membership.JoinedAt = DateTime.UtcNow;
                break;
            case "reject":
                membership.Status = Models.Enums.MembershipStatus.Rejected;
                break;
            case "remove":
                membership.Status = Models.Enums.MembershipStatus.Left;
                break;
            case "change-role":
                if (request.NewRole.HasValue && adminMembership.Role == Models.Enums.CommunityRole.Admin)
                    membership.Role = request.NewRole.Value;
                break;
            default:
                return ApiResponseDto<bool>.ErrorResponse("Ação inválida");
        }

        await _unitOfWork.SaveChangesAsync();
        return ApiResponseDto<bool>.SuccessResponse(true);
    }

    public async Task<ApiResponseDto<List<MembershipResponseDto>>> GetPendingMembershipsAsync(Guid communityId, Guid adminUserId)
    {
        var adminMembership = (await _unitOfWork.CommunityMemberships.FindAsync(
            m => m.UserId == adminUserId && m.CommunityId == communityId && m.Status == Models.Enums.MembershipStatus.Active)).FirstOrDefault();
        if (adminMembership == null || (adminMembership.Role != Models.Enums.CommunityRole.Admin && adminMembership.Role != Models.Enums.CommunityRole.Leader))
            return ApiResponseDto<List<MembershipResponseDto>>.ErrorResponse("Sem permissão");

        var pending = (await _unitOfWork.CommunityMemberships.FindAsync(
            m => m.CommunityId == communityId && m.Status == Models.Enums.MembershipStatus.Pending)).ToList();

        var result = new List<MembershipResponseDto>();
        foreach (var m in pending)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(m.UserId);
            result.Add(new MembershipResponseDto
            {
                Id = m.Id,
                CommunityId = m.CommunityId,
                CommunityName = user?.Name ?? string.Empty,
                Role = m.Role.ToString(),
                Status = m.Status.ToString(),
                CreatedAt = m.CreatedAt,
                UserId = m.UserId,
                UserName = user?.Name ?? string.Empty,
                UserEmail = user?.Email,
                UserPhone = user?.Phone,
                UserProfileImage = user?.ProfileImage,
                UserBio = user?.Bio,
                UserDateOfBirth = user?.DateOfBirth,
                UserGender = user?.Gender,
                UserMaritalStatus = user?.MaritalStatus,
                UserAddress = user?.Address,
                UserCity = user?.City,
                UserDistrict = user?.District,
                UserPostalCode = user?.PostalCode
            });
        }

        return ApiResponseDto<List<MembershipResponseDto>>.SuccessResponse(result);
    }

    public async Task<ApiResponseDto<List<MembershipResponseDto>>> GetMembersAsync(Guid communityId)
    {
        var memberships = (await _unitOfWork.CommunityMemberships.FindAsync(
            m => m.CommunityId == communityId && m.Status == Models.Enums.MembershipStatus.Active)).ToList();

        var result = new List<MembershipResponseDto>();
        foreach (var m in memberships)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(m.UserId);
            result.Add(new MembershipResponseDto
            {
                Id = m.Id,
                CommunityId = m.CommunityId,
                CommunityName = user?.Name ?? string.Empty,
                Role = m.Role.ToString(),
                Status = m.Status.ToString(),
                CreatedAt = m.JoinedAt ?? m.CreatedAt,
                UserId = m.UserId,
                UserName = user?.Name ?? string.Empty,
                UserEmail = user?.Email,
                UserPhone = user?.Phone,
                UserProfileImage = user?.ProfileImage,
                UserBio = user?.Bio,
                UserDateOfBirth = user?.DateOfBirth,
                UserGender = user?.Gender,
                UserMaritalStatus = user?.MaritalStatus,
                UserAddress = user?.Address,
                UserCity = user?.City,
                UserDistrict = user?.District,
                UserPostalCode = user?.PostalCode
            });
        }

        return ApiResponseDto<List<MembershipResponseDto>>.SuccessResponse(result);
    }

    public async Task<ApiResponseDto<MembershipResponseDto>> LeaveCommunityAsync(Guid userId)
    {
        var membership = (await _unitOfWork.CommunityMemberships.FindAsync(
            m => m.UserId == userId && m.Status == Models.Enums.MembershipStatus.Active)).FirstOrDefault();
        if (membership == null)
            return ApiResponseDto<MembershipResponseDto>.ErrorResponse("Não pertence a nenhuma comunidade");

        membership.Status = Models.Enums.MembershipStatus.Left;
        await _unitOfWork.SaveChangesAsync();

        return ApiResponseDto<MembershipResponseDto>.SuccessResponse(new MembershipResponseDto
        {
            Id = membership.Id,
            CommunityId = membership.CommunityId,
            Role = membership.Role.ToString(),
            Status = membership.Status.ToString(),
            CreatedAt = membership.CreatedAt
        });
    }

    public async Task<ApiResponseDto<CommunityResponseDto>> UpdateCommunityAsync(Guid communityId, UpdateCommunityRequestDto request, Guid userId)
    {
        var community = await _unitOfWork.Communities.GetByIdAsync(communityId);
        if (community == null)
            return ApiResponseDto<CommunityResponseDto>.ErrorResponse("Comunidade não encontrada");

        var membership = (await _unitOfWork.CommunityMemberships.FindAsync(
            m => m.UserId == userId && m.CommunityId == communityId && m.Role == Models.Enums.CommunityRole.Admin && m.Status == Models.Enums.MembershipStatus.Active)).FirstOrDefault();
        if (membership == null)
            return ApiResponseDto<CommunityResponseDto>.ErrorResponse("Sem permissão para editar a comunidade");

        if (request.Name != null) community.Name = request.Name;
        if (request.Description != null) community.Description = request.Description;
        if (request.Nipc != null) community.Nipc = request.Nipc;
        if (request.Email != null) community.Email = request.Email;
        if (request.Phone != null) community.Phone = request.Phone;
        if (request.Address != null) community.Address = request.Address;
        if (request.LogoUrl != null) community.LogoUrl = request.LogoUrl;
        community.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Communities.UpdateAsync(community);
        await _unitOfWork.SaveChangesAsync();

        var memberCount = (await _unitOfWork.CommunityMemberships.FindAsync(
            m => m.CommunityId == communityId && m.Status == Models.Enums.MembershipStatus.Active)).Count();
        var subscription = (await _unitOfWork.CommunitySubscriptions.FindAsync(
            s => s.CommunityId == communityId && s.Status == Models.Enums.SubscriptionStatus.Active)).FirstOrDefault();

        return ApiResponseDto<CommunityResponseDto>.SuccessResponse(new CommunityResponseDto
        {
            Id = community.Id,
            Name = community.Name,
            Description = community.Description,
            LogoUrl = community.LogoUrl,
            Slug = community.Slug,
            MemberCount = memberCount,
            PlanName = subscription?.Plan?.Name,
            CreatedAt = community.CreatedAt
        });
    }
}
