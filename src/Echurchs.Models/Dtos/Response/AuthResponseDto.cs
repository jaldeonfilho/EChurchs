namespace Echurchs.Models.Dtos.Response;

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }
    public UserResponseDto User { get; set; } = null!;
}
