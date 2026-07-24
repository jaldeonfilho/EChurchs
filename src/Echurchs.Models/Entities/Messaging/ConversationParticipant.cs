namespace Echurchs.Models.Entities.Messaging;

public class ConversationParticipant
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid UserId { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LeftAt { get; set; }

    public Conversation Conversation { get; set; } = null!;
    public Core.User User { get; set; } = null!;
}
