using AquaSmart.Api.Dtos;
using AquaSmart.Api.Models;
using AquaSmart.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace AquaSmart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class SettingsController(ISettingsRepository settingsRepository) : ControllerBase
{
    [HttpGet("{deviceId}")]
    public async Task<ActionResult<DeviceSettings>> GetLatest(string deviceId, CancellationToken cancellationToken)
    {
        var settings = await settingsRepository.GetLatestAsync(deviceId.Trim(), cancellationToken);
        if (settings is not null)
        {
            return Ok(settings);
        }

        var defaults = new DeviceSettings
        {
            DeviceId = deviceId.Trim(),
            AutoFill = true,
            SmartScheduling = true,
            OverflowProtection = true,
            LowTankAlert = true,
            PoorQualityAlert = true,
            FilterMaintenanceAlert = true,
            UpdatedAtUtc = DateTime.UtcNow
        };

        var created = await settingsRepository.SaveAsync(defaults, cancellationToken);
        return Ok(created);
    }

    [HttpPut("{deviceId}")]
    public async Task<ActionResult<DeviceSettings>> Update(
        string deviceId,
        [FromBody] UpdateDeviceSettingsRequest request,
        CancellationToken cancellationToken)
    {
        var settings = new DeviceSettings
        {
            DeviceId = deviceId.Trim(),
            AutoFill = request.AutoFill,
            SmartScheduling = request.SmartScheduling,
            OverflowProtection = request.OverflowProtection,
            LowTankAlert = request.LowTankAlert,
            PoorQualityAlert = request.PoorQualityAlert,
            FilterMaintenanceAlert = request.FilterMaintenanceAlert,
            UpdatedAtUtc = DateTime.UtcNow
        };

        var saved = await settingsRepository.SaveAsync(settings, cancellationToken);
        return Ok(saved);
    }

    [HttpGet("{deviceId}/history")]
    public async Task<ActionResult<IReadOnlyList<DeviceSettings>>> GetHistory(
        string deviceId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(page, 1);
        pageSize = pageSize is < 1 or > 1000 ? 100 : pageSize;

        var history = await settingsRepository.GetHistoryAsync(
            deviceId.Trim(),
            pageSize,
            (page - 1) * pageSize,
            cancellationToken);

        return Ok(history);
    }
}
