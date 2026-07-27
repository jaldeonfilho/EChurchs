using Echurchs.Models.Enums;

namespace Echurchs.Models.Dtos.Request;

public class CreatePostRequestDto
{
    public PostType Type { get; set; }
    public string? Content { get; set; }
    public string? MediaUrl { get; set; }
    public string? LiveUrl { get; set; }
    public string? EventTitle { get; set; }
    public DateTime? EventDate { get; set; }
    public DateTime? EventEndDate { get; set; }
    public string? EventLocation { get; set; }
}
