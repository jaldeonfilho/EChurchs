namespace Echurchs.Models.Dtos.Request;

public class UpdateProfileRequestDto
{
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Bio { get; set; }
    public string? ProfileImage { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? MaritalStatus { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? District { get; set; }
    public string? PostalCode { get; set; }
}
