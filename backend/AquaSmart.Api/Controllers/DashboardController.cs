using AquaSmart.Api.Dtos;
using AquaSmart.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace AquaSmart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class DashboardController(
    ISensorReadingRepository sensorReadingRepository,
    ISettingsRepository settingsRepository) : ControllerBase
{
    [HttpGet("{deviceId}")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary(string deviceId, CancellationToken cancellationToken)
    {
        var readings = await sensorReadingRepository.GetLatestPerSensorAsync(deviceId.Trim(), cancellationToken);
        var settings = await settingsRepository.GetLatestAsync(deviceId.Trim(), cancellationToken);

        var ph = readings.FirstOrDefault(x => x.SensorType.Equals("ph", StringComparison.OrdinalIgnoreCase))?.Value;
        var tds = readings.FirstOrDefault(x => x.SensorType.Equals("tds", StringComparison.OrdinalIgnoreCase))?.Value;
        var turbidity = readings.FirstOrDefault(x => x.SensorType.Equals("turbidity", StringComparison.OrdinalIgnoreCase))?.Value;
        var temperature = readings.FirstOrDefault(x => x.SensorType.Equals("temperature", StringComparison.OrdinalIgnoreCase))?.Value;
        var tankLevel = readings.FirstOrDefault(x => x.SensorType.Equals("tankLevel", StringComparison.OrdinalIgnoreCase))?.Value ?? 0;
        var liters = readings.FirstOrDefault(x => x.SensorType.Equals("litersAvailable", StringComparison.OrdinalIgnoreCase))?.Value ?? 0;
        var pumpStatus = readings.FirstOrDefault(x => x.SensorType.Equals("pumpStatus", StringComparison.OrdinalIgnoreCase))?.Status ?? "Unknown";
        var filterStatus = readings.FirstOrDefault(x => x.SensorType.Equals("filterStatus", StringComparison.OrdinalIgnoreCase))?.Status ?? "Unknown";

        var quality = "Unknown";
        if (ph is >= 6.5 and <= 8.5 && tds is <= 500 && turbidity is <= 5)
        {
            quality = "Good";
        }
        else if (ph.HasValue || tds.HasValue || turbidity.HasValue)
        {
            quality = "Warning";
        }

        var dto = new DashboardSummaryDto
        {
            DeviceId = deviceId.Trim(),
            TankLevel = tankLevel,
            LitersAvailable = liters,
            WaterQuality = quality,
            FilterStatus = filterStatus,
            PhLevel = ph,
            Tds = tds,
            Turbidity = turbidity,
            Temperature = temperature,
            Automation = settings is null ? "Unknown" : (settings.AutoFill ? "Enabled" : "Disabled"),
            PumpStatus = pumpStatus,
            GeneratedAtUtc = DateTime.UtcNow
        };

        return Ok(dto);
    }
}
