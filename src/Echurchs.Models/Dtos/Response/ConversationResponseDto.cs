namespace Echurchs.Models.Dtos.Response;

public class ConversationResponseDto
{
    public Guid Id { get; set; }
    public bool IsGroup { get; set; }
    public string? Title { get; set; }
    public List<ConversationParticipantDto> Participants { get; set; } = new();
    public MessageResponseDto? LastMessage { get; set; }
}
