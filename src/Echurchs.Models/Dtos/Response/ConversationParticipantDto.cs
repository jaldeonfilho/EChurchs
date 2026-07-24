namespace Echurchs.Models.Dtos.Response;

public class ConversationParticipantDto
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? ProfileImage { get; set; }
}
