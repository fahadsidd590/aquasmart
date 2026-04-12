using System.ComponentModel.DataAnnotations;

namespace AquaSmart.Api.Dtos;

public sealed class CreateSensorReadingRequest
{
    [Required]
    [MaxLength(100)]
    public string DeviceId { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string SensorType { get; set; } = string.Empty;

    [Required]
    public double Value { get; set; }

    [MaxLength(30)]
    public string Unit { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Status { get; set; }

    public Dictionary<string, string>? Metadata { get; set; }

    public DateTime? RecordedAtUtc { get; set; }
}
