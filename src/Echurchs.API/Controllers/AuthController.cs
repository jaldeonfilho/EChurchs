using System.Security.Claims;
using Echurchs.Models.Dtos.Request;
using Echurchs.Models.Dtos.Response;
using Echurchs.Models.Dtos.Shared;
using Echurchs.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Echurchs.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponseDto<AuthResponseDto>>> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request);
        if (result == null)
            return Unauthorized(ApiResponseDto<AuthResponseDto>.ErrorResponse("Email ou senha inválidos"));
        return Ok(ApiResponseDto<AuthResponseDto>.SuccessResponse(result));
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponseDto<AuthResponseDto>>> Register([FromBody] RegisterRequestDto request)
    {
        var result = await _authService.RegisterAsync(request);
        if (result == null)
            return BadRequest(ApiResponseDto<AuthResponseDto>.ErrorResponse("Email já cadastrado ou dados inválidos"));
        return Ok(ApiResponseDto<AuthResponseDto>.SuccessResponse(result));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<ApiResponseDto<AuthResponseDto>>> RefreshToken([FromBody] RefreshTokenRequestDto request)
    {
        var result = await _authService.RefreshTokenAsync(request.RefreshToken);
        if (result == null)
            return Unauthorized(ApiResponseDto<AuthResponseDto>.ErrorResponse("Token inválido ou expirado"));
        return Ok(ApiResponseDto<AuthResponseDto>.SuccessResponse(result));
    }

    [HttpPost("revoke")]
    public async Task<IActionResult> RevokeToken([FromBody] RefreshTokenRequestDto request)
    {
        await _authService.RevokeTokenAsync(request.RefreshToken);
        return Ok();
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<ApiResponseDto<AuthResponseDto>>> UpdateProfile([FromBody] UpdateProfileRequestDto request)
    {
        var result = await _authService.UpdateProfileAsync(UserId, request);
        if (result == null)
            return BadRequest(ApiResponseDto<AuthResponseDto>.ErrorResponse("Utilizador não encontrado"));
        return Ok(ApiResponseDto<AuthResponseDto>.SuccessResponse(result));
    }
}

public class RefreshTokenRequestDto
{
    public string RefreshToken { get; set; } = string.Empty;
}
