using AquaSmart.Api.Dtos;
using AquaSmart.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace AquaSmart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class QualityController(ISensorReadingRepository sensorReadingRepository) : ControllerBase
{
    [HttpGet("{deviceId}")]
    public async Task<ActionResult<QualityOverviewDto>> GetOverview(string deviceId, CancellationToken cancellationToken)
    {
        var readings = await sensorReadingRepository.GetLatestPerSensorAsync(deviceId.Trim(), cancellationToken);

        double? ph = readings.FirstOrDefault(x => x.SensorType.Equals("ph", StringComparison.OrdinalIgnoreCase))?.Value;
        double? tds = readings.FirstOrDefault(x => x.SensorType.Equals("tds", StringComparison.OrdinalIgnoreCase))?.Value;
        double? turbidity = readings.FirstOrDefault(x => x.SensorType.Equals("turbidity", StringComparison.OrdinalIgnoreCase))?.Value;
        double? temperature = readings.FirstOrDefault(x => x.SensorType.Equals("temperature", StringComparison.OrdinalIgnoreCase))?.Value;

        string phStatus = GetStatus(ph, 6.5, 8.5);
        string tdsStatus = GetStatus(tds, 0, 500);
        string turbidityStatus = GetStatus(turbidity, 0, 5);
        string tempStatus = GetStatus(temperature, 18, 35);

        var overall = new[] { phStatus, tdsStatus, turbidityStatus, tempStatus }.Contains("Poor")
            ? "Poor"
            : (new[] { phStatus, tdsStatus, turbidityStatus, tempStatus }.Contains("Warning") ? "Warning" : "Good");

        var dto = new QualityOverviewDto
        {
            DeviceId = deviceId.Trim(),
            OverallStatus = overall,
            Description = overall switch
            {
                "Good" => "Safe for non-potable use",
                "Warning" => "Some parameters near threshold",
                _ => "Water needs attention before use"
            },
            DecisionTitle = overall == "Good" ? "Water Quality Approved" : "Water Quality Alert",
            DecisionDescription = overall == "Good"
                ? "All parameters within acceptable range"
                : "One or more parameters are outside acceptable range",
            UseRecommendation = overall == "Good"
                ? "Suitable for gardening, cleaning, and flushing"
                : "Review filtration and treatment before usage",
            Metrics =
            [
                new QualityMetricDto { Label = "pH Level", SensorType = "ph", Value = ph?.ToString("0.##") ?? "N/A", Status = phStatus },
                new QualityMetricDto { Label = "Turbidity", SensorType = "turbidity", Value = turbidity is null ? "N/A" : $"{turbidity:0.##} NTU", Status = turbidityStatus },
                new QualityMetricDto { Label = "TDS", SensorType = "tds", Value = tds is null ? "N/A" : $"{tds:0.##} ppm", Status = tdsStatus },
                new QualityMetricDto { Label = "Temperature", SensorType = "temperature", Value = temperature is null ? "N/A" : $"{temperature:0.##} C", Status = tempStatus }
            ]
        };

        return Ok(dto);
    }

    [HttpGet("{deviceId}/history")]
    public async Task<IActionResult> GetHistory(
        string deviceId,
        [FromQuery] string sensorType,
        [FromQuery] DateTime? fromUtc,
        [FromQuery] DateTime? toUtc,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(sensorType))
        {
            return BadRequest("sensorType is required.");
        }

        page = Math.Max(page, 1);
        pageSize = pageSize is < 1 or > 1000 ? 100 : pageSize;

        var data = await sensorReadingRepository.GetHistoryAsync(
            deviceId.Trim(),
            sensorType.Trim(),
            fromUtc,
            toUtc,
            pageSize,
            (page - 1) * pageSize,
            cancellationToken);

        return Ok(data);
    }

    private static string GetStatus(double? value, double min, double max)
    {
        if (!value.HasValue) return "Unknown";
        if (value.Value < min || value.Value > max) return "Poor";
        var band = (max - min) * 0.1;
        return value.Value <= min + band || value.Value >= max - band ? "Warning" : "Good";
    }
}
