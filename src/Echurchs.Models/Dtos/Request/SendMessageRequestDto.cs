namespace Echurchs.Models.Dtos.Request;

public class SendMessageRequestDto
{
    public Guid ConversationId { get; set; }
    public string Content { get; set; } = string.Empty;
}
