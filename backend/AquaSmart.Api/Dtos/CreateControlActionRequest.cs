using System.ComponentModel.DataAnnotations;

namespace AquaSmart.Api.Dtos;

public sealed class CreateControlActionRequest
{
    [Required]
    [MaxLength(100)]
    public string DeviceId { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;

    [MaxLength(100)]
    public string TriggeredBy { get; set; } = "manual";

    [MaxLength(500)]
    public string? Notes { get; set; }
}
