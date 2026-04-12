using System.ComponentModel.DataAnnotations;

namespace AquaSmart.Api.Dtos;

public sealed class CreateWaterFilterRequest
{
    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(120)]
    public string? Brand { get; set; }

    [MaxLength(120)]
    public string? Model { get; set; }

    [MaxLength(120)]
    public string? SerialNumber { get; set; }

    public DateTime InstallDateUtc { get; set; }

    public DateTime ExpireDateUtc { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}
