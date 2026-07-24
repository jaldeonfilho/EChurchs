namespace Echurchs.Models.Dtos.Response;

public class MembershipResponseDto
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string CommunityName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? UserEmail { get; set; }
    public string? UserPhone { get; set; }
    public string? UserProfileImage { get; set; }
    public string? UserBio { get; set; }
    public DateTime? UserDateOfBirth { get; set; }
    public string? UserGender { get; set; }
    public string? UserMaritalStatus { get; set; }
    public string? UserAddress { get; set; }
    public string? UserCity { get; set; }
    public string? UserDistrict { get; set; }
    public string? UserPostalCode { get; set; }
}
