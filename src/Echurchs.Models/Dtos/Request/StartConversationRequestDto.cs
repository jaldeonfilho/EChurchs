namespace Echurchs.Models.Dtos.Request;

public class StartConversationRequestDto
{
    public Guid? RecipientUserId { get; set; }
    public string? Title { get; set; }
    public List<Guid>? ParticipantIds { get; set; }
}
