using System.ComponentModel.DataAnnotations;

namespace AquaSmart.Api.Dtos;

public sealed class BootstrapRequest
{
    [Required]
    public string SecretKey { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;
}
