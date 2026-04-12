using System.ComponentModel.DataAnnotations;

namespace AquaSmart.Api.Dtos;

public sealed class AdminCreateUserRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;

    /// <summary>Usually "User" for mobile app accounts.</summary>
    [MaxLength(50)]
    public string Role { get; set; } = Authorization.Roles.User;

    public bool IsActive { get; set; } = true;
}
