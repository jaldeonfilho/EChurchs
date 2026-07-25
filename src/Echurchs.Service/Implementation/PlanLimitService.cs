using Echurchs.Models.Dtos.Response;
using Echurchs.Repository.Interfaces;
using Echurchs.Service.Interfaces;

namespace Echurchs.Service.Implementation;

public class PlanLimitService : IPlanLimitService
{
    private readonly IUnitOfWork _unitOfWork;

    private static readonly List<(string Module, string Feature)> TrackedFeatures = new()
    {
        ("Pessoas", "MaxMembers"),
        ("Grupos", "MaxGroups"),
        ("Eventos", "MaxEvents"),
        ("Agenda", "MaxBulletins"),
        ("Mídias", "MaxDocuments"),
        ("Mídias", "MaxPhotos"),
        ("Mídias", "MaxVideos"),
        ("Live", "MaxConcurrentLiveServices"),
    };

    public PlanLimitService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PlanLimitCheckResult> CheckLimitAsync(Guid communityId, string module, string feature)
    {
        var subscription = (await _unitOfWork.CommunitySubscriptions.FindAsync(s => s.CommunityId == communityId)).FirstOrDefault();
        if (subscription == null)
            return new PlanLimitCheckResult { Allowed = true, LimitValue = -1, CurrentUsage = 0, PlanName = "Free" };

        var plan = await _unitOfWork.Plans.GetByIdAsync(subscription.PlanId);
        var planName = plan?.Name ?? "Free";

        var limit = (await _unitOfWork.PlanLimits.FindAsync(
            l => l.PlanId == subscription.PlanId && l.Module == module && l.Feature == feature)).FirstOrDefault();

        if (limit == null || limit.LimitValue == -1)
            return new PlanLimitCheckResult { Allowed = true, LimitValue = -1, CurrentUsage = 0, PlanName = planName };

        var currentUsage = await GetCurrentUsageAsync(communityId, feature);
        return new PlanLimitCheckResult
        {
            Allowed = currentUsage < limit.LimitValue,
            LimitValue = limit.LimitValue,
            CurrentUsage = currentUsage,
            PlanName = planName
        };
    }

    public async Task<List<PlanUsageItemDto>> GetUsageSummaryAsync(Guid communityId)
    {
        var subscription = (await _unitOfWork.CommunitySubscriptions.FindAsync(s => s.CommunityId == communityId)).FirstOrDefault();
        var result = new List<PlanUsageItemDto>();
        if (subscription == null) return result;

        var limits = (await _unitOfWork.PlanLimits.FindAsync(l => l.PlanId == subscription.PlanId)).ToList();

        foreach (var (module, feature) in TrackedFeatures)
        {
            var limit = limits.FirstOrDefault(l => l.Module == module && l.Feature == feature);
            if (limit == null) continue;

            var isUnlimited = limit.LimitValue == -1;
            var usage = isUnlimited ? 0 : await GetCurrentUsageAsync(communityId, feature);

            result.Add(new PlanUsageItemDto
            {
                Module = module,
                Feature = feature,
                LimitValue = limit.LimitValue,
                CurrentUsage = usage,
                IsUnlimited = isUnlimited,
                Description = limit.Description
            });
        }

        return result;
    }

    private async Task<int> GetCurrentUsageAsync(Guid communityId, string feature)
    {
        switch (feature)
        {
            case "MaxMembers":
                return await _unitOfWork.CommunityMemberships.CountAsync(
                    m => m.CommunityId == communityId && m.Status == Models.Enums.MembershipStatus.Active);
            case "MaxGroups":
                return await _unitOfWork.Groups.CountAsync(g => g.CommunityId == communityId);
            case "MaxEvents":
                return await _unitOfWork.CalendarEvents.CountAsync(e => e.CommunityId == communityId);
            case "MaxBulletins":
                return await _unitOfWork.Bulletins.CountAsync(b => b.CommunityId == communityId);
            case "MaxDocuments":
                return await _unitOfWork.Documents.CountAsync(d => d.CommunityId == communityId);
            case "MaxPhotos":
                var paIds = (await _unitOfWork.PhotoAlbums.FindAsync(a => a.CommunityId == communityId)).Select(a => a.Id).ToList();
                return await _unitOfWork.Photos.CountAsync(p => paIds.Contains(p.AlbumId));
            case "MaxVideos":
                var vaIds = (await _unitOfWork.VideoAlbums.FindAsync(a => a.CommunityId == communityId)).Select(a => a.Id).ToList();
                return await _unitOfWork.Videos.CountAsync(v => vaIds.Contains(v.AlbumId));
            case "MaxConcurrentLiveServices":
                return await _unitOfWork.LiveServices.CountAsync(
                    l => l.CommunityId == communityId && l.Status == Models.Enums.LiveServiceStatus.Live);
            default:
                return 0;
        }
    }
}
