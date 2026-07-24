using Echurchs.Models.Dtos.Request;
using Echurchs.Models.Dtos.Response;

namespace Echurchs.Service.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginRequestDto request);
    Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto request);
    Task<AuthResponseDto?> RefreshTokenAsync(string refreshToken);
    Task RevokeTokenAsync(string refreshToken);
    Task<AuthResponseDto?> UpdateProfileAsync(Guid userId, UpdateProfileRequestDto request);
}
