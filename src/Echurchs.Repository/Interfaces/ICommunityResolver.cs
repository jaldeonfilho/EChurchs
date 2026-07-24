namespace Echurchs.Repository.Interfaces;

public interface ICommunityResolver
{
    Guid? GetCurrentCommunityId();
    void SetCurrentCommunityId(Guid communityId);
}
