using System.ComponentModel.DataAnnotations;

namespace AquaSmart.Api.Dtos;

public sealed class UpdateWaterFilterRequest
{
    [MaxLength(200)]
    public string? Name { get; set; }

    [MaxLength(120)]
    public string? Brand { get; set; }

    [MaxLength(120)]
    public string? Model { get; set; }

    [MaxLength(120)]
    public string? SerialNumber { get; set; }

    public DateTime? InstallDateUtc { get; set; }

    public DateTime? ExpireDateUtc { get; set; }

    public bool? IsActive { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}
