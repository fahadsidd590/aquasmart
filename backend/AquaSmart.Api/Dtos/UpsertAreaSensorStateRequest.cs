using System.ComponentModel.DataAnnotations;

namespace AquaSmart.Api.Dtos;

public sealed class UpsertAreaSensorStateRequest
{
    public int? AreaId { get; set; }

    [Required]
    public double Turbidity { get; set; }

    [Required]
    public double Ph { get; set; }

    [Required]
    public double Tds { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string CleanValve { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string DirtyValve { get; set; } = string.Empty;

    /// <summary>
    /// "0" = tank not full, "1" = tank full.
    /// </summary>
    [MaxLength(10)]
    public string? WaterLevel { get; set; }
}
