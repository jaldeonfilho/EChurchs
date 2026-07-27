namespace Echurchs.Models.Dtos.Response;

public class FeedItemResponseDto
{
    public Guid Id { get; set; }
    public string Source { get; set; } = string.Empty; // "Post" | "CalendarEvent"
    public string? PostType { get; set; } // Live | Media | Event, only when Source == "Post"

    public Guid AuthorId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string? AuthorProfileImage { get; set; }

    public Guid? CommunityId { get; set; }
    public string? CommunityName { get; set; }
    public string? CommunityLogoUrl { get; set; }

    public string? Content { get; set; }
    public string? MediaUrl { get; set; }
    public string? LiveUrl { get; set; }

    public string? EventTitle { get; set; }
    public DateTime? EventDate { get; set; }
    public DateTime? EventEndDate { get; set; }
    public string? EventLocation { get; set; }

    public DateTime CreatedAt { get; set; }
}
