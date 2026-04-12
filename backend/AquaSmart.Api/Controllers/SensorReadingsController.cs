using AquaSmart.Api.Dtos;
using AquaSmart.Api.Models;
using AquaSmart.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace AquaSmart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class SensorReadingsController(ISensorReadingRepository repository) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<SensorReading>> Create(
        [FromBody] CreateSensorReadingRequest request,
        CancellationToken cancellationToken)
    {
        var reading = new SensorReading
        {
            DeviceId = request.DeviceId.Trim(),
            SensorType = request.SensorType.Trim(),
            Value = request.Value,
            Unit = request.Unit.Trim(),
            Status = request.Status?.Trim(),
            Metadata = request.Metadata,
            RecordedAtUtc = request.RecordedAtUtc ?? DateTime.UtcNow,
            ReceivedAtUtc = DateTime.UtcNow
        };

        var created = await repository.CreateAsync(reading, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SensorReading>> GetById(string id, CancellationToken cancellationToken)
    {
        var reading = await repository.GetByIdAsync(id, cancellationToken);
        return reading is null ? NotFound() : Ok(reading);
    }

    [HttpGet("history")]
    public async Task<ActionResult<IReadOnlyList<SensorReading>>> GetHistory(
        [FromQuery] string? deviceId,
        [FromQuery] string? sensorType,
        [FromQuery] DateTime? fromUtc,
        [FromQuery] DateTime? toUtc,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100,
        CancellationToken cancellationToken = default)
    {
        if (page < 1) page = 1;
        if (pageSize is < 1 or > 1000) pageSize = 100;

        var skip = (page - 1) * pageSize;
        var readings = await repository.GetHistoryAsync(
            deviceId?.Trim(),
            sensorType?.Trim(),
            fromUtc,
            toUtc,
            pageSize,
            skip,
            cancellationToken);

        return Ok(readings);
    }

    [HttpGet("latest/{deviceId}")]
    public async Task<ActionResult<IReadOnlyList<SensorReading>>> GetLatestForDevice(
        string deviceId,
        CancellationToken cancellationToken)
    {
        var readings = await repository.GetLatestPerSensorAsync(deviceId.Trim(), cancellationToken);
        return Ok(readings);
    }
}
