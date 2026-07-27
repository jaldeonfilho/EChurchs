namespace Echurchs.Models.Dtos.Response;

public class FeedPageResponseDto
{
    public List<FeedItemResponseDto> Items { get; set; } = new();
    public bool HasMore { get; set; }
}
