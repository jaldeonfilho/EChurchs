using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Echurchs.Models.Dtos.Request;
using Echurchs.Models.Dtos.Response;
using Echurchs.Models.Entities.Core;
using Echurchs.Repository.Interfaces;
using Echurchs.Service.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Echurchs.Service.Implementation;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;

    public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginRequestDto request)
    {
        var user = (await _unitOfWork.Users.FindAsync(u => u.Email == request.Email)).FirstOrDefault();
        if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            return null;

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto request)
    {
        if (await _unitOfWork.Users.ExistsAsync(u => u.Email == request.Email))
            return null;

        if (request.Password != request.ConfirmPassword)
            return null;

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            PasswordHash = HashPassword(request.Password)
        };

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<AuthResponseDto?> RefreshTokenAsync(string refreshToken)
    {
        var token = (await _unitOfWork.RefreshTokens.FindAsync(t => t.Token == refreshToken)).FirstOrDefault();
        if (token == null || token.IsRevoked || token.ExpiresAt < DateTime.UtcNow)
            return null;

        var user = await _unitOfWork.Users.GetByIdAsync(token.UserId);
        if (user == null) return null;

        token.IsRevoked = true;
        await _unitOfWork.SaveChangesAsync();

        return await GenerateAuthResponseAsync(user);
    }

    public async Task RevokeTokenAsync(string refreshToken)
    {
        var token = (await _unitOfWork.RefreshTokens.FindAsync(t => t.Token == refreshToken)).FirstOrDefault();
        if (token != null)
        {
            token.IsRevoked = true;
            await _unitOfWork.SaveChangesAsync();
        }
    }

    public async Task<AuthResponseDto?> UpdateProfileAsync(Guid userId, UpdateProfileRequestDto request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null) return null;

        if (request.Name != null) user.Name = request.Name;
        if (request.Phone != null) user.Phone = request.Phone;
        if (request.Bio != null) user.Bio = request.Bio;
        if (request.ProfileImage != null) user.ProfileImage = request.ProfileImage;
        if (request.DateOfBirth.HasValue) user.DateOfBirth = request.DateOfBirth;
        if (request.Gender != null) user.Gender = request.Gender;
        if (request.MaritalStatus != null) user.MaritalStatus = request.MaritalStatus;
        if (request.Address != null) user.Address = request.Address;
        if (request.City != null) user.City = request.City;
        if (request.District != null) user.District = request.District;
        if (request.PostalCode != null) user.PostalCode = request.PostalCode;
        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();

        return await GenerateAuthResponseAsync(user);
    }

    private async Task<AuthResponseDto> GenerateAuthResponseAsync(User user)
    {
        var expiration = DateTime.UtcNow.AddHours(2);
        var token = GenerateJwtToken(user, expiration);
        var refreshTk = GenerateRefreshToken();

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshTk,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };
        await _unitOfWork.RefreshTokens.AddAsync(refreshToken);
        await _unitOfWork.SaveChangesAsync();

        var memberships = (await _unitOfWork.CommunityMemberships.FindAsync(m => m.UserId == user.Id && m.Status == Models.Enums.MembershipStatus.Active)).ToList();

        var membershipDtos = new List<MembershipResponseDto>();
        foreach (var m in memberships)
        {
            var community = await _unitOfWork.Communities.GetByIdAsync(m.CommunityId);
            membershipDtos.Add(new MembershipResponseDto
            {
                Id = m.Id,
                CommunityId = m.CommunityId,
                CommunityName = community?.Name ?? string.Empty,
                Role = m.Role.ToString(),
                Status = m.Status.ToString(),
                CreatedAt = m.CreatedAt
            });
        }

        return new AuthResponseDto
        {
            Token = token,
            RefreshToken = refreshTk,
            Expiration = expiration,
            User = new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                ProfileImage = user.ProfileImage,
                Phone = user.Phone,
                Bio = user.Bio,
                DateOfBirth = user.DateOfBirth,
                Gender = user.Gender,
                MaritalStatus = user.MaritalStatus,
                Address = user.Address,
                City = user.City,
                District = user.District,
                PostalCode = user.PostalCode,
                Memberships = membershipDtos
            }
        };
    }

    private string GenerateJwtToken(User user, DateTime expiration)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiration,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    private static bool VerifyPassword(string password, string hash)
    {
        return HashPassword(password) == hash;
    }
}
