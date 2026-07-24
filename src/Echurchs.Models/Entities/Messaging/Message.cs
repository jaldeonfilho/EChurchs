namespace Echurchs.Models.Entities.Messaging;

public class Message
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid SenderId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }

    public Conversation Conversation { get; set; } = null!;
    public Core.User Sender { get; set; } = null!;
}
