using AquaSmart.Api.Dtos;
using AquaSmart.Api.Models;
using AquaSmart.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace AquaSmart.Api.Controllers;

[ApiController]
[Route("api/area-sensor-state")]
public sealed class AreaSensorStateController(
    IAreaSensorStateRepository repository,
    IControlActionRepository controlActionRepository) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<AreaSensorStateWithPumpResponse>> Upsert(
        [FromBody] UpsertAreaSensorStateRequest request,
        CancellationToken cancellationToken)
    {
        var areaId = request.AreaId.GetValueOrDefault(1);
        if (areaId <= 0)
        {
            areaId = 1;
        }

        var state = new AreaSensorState
        {
            AreaId = areaId,
            Turbidity = request.Turbidity,
            Ph = request.Ph,
            Tds = request.Tds,
            Status = request.Status.Trim(),
            CleanValve = request.CleanValve.Trim(),
            DirtyValve = request.DirtyValve.Trim(),
            WaterLevel = NormalizeWaterLevel(request.WaterLevel),
            UpdatedAtUtc = DateTime.UtcNow
        };

        var upserted = await repository.UpsertAsync(state, cancellationToken);
        var pumpData = await ResolvePumpDataAsync(areaId, cancellationToken);
        return Ok(new AreaSensorStateWithPumpResponse
        {
            Data = upserted,
            PumpData = pumpData
        });
    }

    [HttpGet("current")]
    public async Task<ActionResult<AreaSensorStateWithPumpResponse>> GetCurrent(
        [FromQuery] int? areaId,
        CancellationToken cancellationToken)
    {
        var normalizedAreaId = areaId.GetValueOrDefault(1);
        if (normalizedAreaId <= 0)
        {
            normalizedAreaId = 1;
        }

        var state = await repository.GetByAreaIdAsync(normalizedAreaId, cancellationToken);
        if (state is null)
        {
            return NotFound();
        }

        var pumpData = await ResolvePumpDataAsync(normalizedAreaId, cancellationToken);
        return Ok(new AreaSensorStateWithPumpResponse
        {
            Data = state,
            PumpData = pumpData
        });
    }

    private async Task<int> ResolvePumpDataAsync(int pumpAreaId, CancellationToken cancellationToken)
    {
        var latestAction = await controlActionRepository.GetLatestForPumpAsync(pumpAreaId, cancellationToken);
        if (latestAction is null || string.IsNullOrWhiteSpace(latestAction.Action))
        {
            return 0;
        }

        var action = latestAction.Action.Trim().ToLowerInvariant();
        if (action.Contains("start") || action.Contains("on"))
        {
            return 1;
        }

        if (action.Contains("stop") || action.Contains("off"))
        {
            return 0;
        }

        return 0;
    }

    /// <summary>
    /// Accepts "0" / "1" (or whitespace); anything else defaults to "0" (not full).
    /// </summary>
    private static string NormalizeWaterLevel(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return "0";
        }

        return raw.Trim() == "1" ? "1" : "0";
    }
}
