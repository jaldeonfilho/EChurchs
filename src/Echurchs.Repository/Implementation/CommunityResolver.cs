namespace Echurchs.Repository.Implementation;

public class CommunityResolver : Interfaces.ICommunityResolver
{
    private Guid? _currentCommunityId;

    public Guid? GetCurrentCommunityId() => _currentCommunityId;

    public void SetCurrentCommunityId(Guid communityId)
    {
        _currentCommunityId = communityId;
    }
}
