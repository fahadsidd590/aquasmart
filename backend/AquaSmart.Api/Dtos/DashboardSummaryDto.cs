namespace AquaSmart.Api.Dtos;

public sealed class DashboardSummaryDto
{
    public string DeviceId { get; set; } = string.Empty;

    public double TankLevel { get; set; }

    public double LitersAvailable { get; set; }

    public string WaterQuality { get; set; } = "Unknown";

    public string FilterStatus { get; set; } = "Unknown";

    public double? PhLevel { get; set; }

    public double? Tds { get; set; }

    public double? Turbidity { get; set; }

    public double? Temperature { get; set; }

    public string Automation { get; set; } = "Unknown";

    public string PumpStatus { get; set; } = "Unknown";

    public DateTime GeneratedAtUtc { get; set; } = DateTime.UtcNow;
}
