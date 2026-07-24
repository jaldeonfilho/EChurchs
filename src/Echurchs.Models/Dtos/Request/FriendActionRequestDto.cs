namespace Echurchs.Models.Dtos.Request;

public class FriendActionRequestDto
{
    public Guid FriendshipId { get; set; }
    public string Action { get; set; } = string.Empty;
}
