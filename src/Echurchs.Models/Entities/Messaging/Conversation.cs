namespace Echurchs.Models.Entities.Messaging;

public class Conversation
{
    public Guid Id { get; set; }
    public bool IsGroup { get; set; }
    public string? Title { get; set; }
    public Guid? CommunityId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Core.Community? Community { get; set; }
    public ICollection<ConversationParticipant> Participants { get; set; } = new List<ConversationParticipant>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
