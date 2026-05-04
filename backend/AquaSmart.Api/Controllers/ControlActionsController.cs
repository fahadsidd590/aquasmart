using AquaSmart.Api.Dtos;
using AquaSmart.Api.Models;
using AquaSmart.Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AquaSmart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class ControlActionsController(IControlActionRepository controlActionRepository) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ControlActionLog>> Create(
        [FromBody] CreateControlActionRequest request,
        CancellationToken cancellationToken)
    {
        var action = new ControlActionLog
        {
            DeviceId = request.DeviceId.Trim(),
            Action = request.Action.Trim(),
            TriggeredBy = string.IsNullOrWhiteSpace(request.TriggeredBy) ? "manual" : request.TriggeredBy.Trim(),
            Notes = request.Notes?.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        var saved = await controlActionRepository.CreateAsync(action, cancellationToken);
        return CreatedAtAction(nameof(GetHistory), new { deviceId = saved.DeviceId }, saved);
    }

    [HttpGet("history")]
    public async Task<ActionResult<IReadOnlyList<ControlActionLog>>> GetHistory(
        [FromQuery] string? deviceId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(page, 1);
        pageSize = pageSize is < 1 or > 1000 ? 100 : pageSize;

        var history = await controlActionRepository.GetHistoryAsync(
            deviceId?.Trim(),
            pageSize,
            (page - 1) * pageSize,
            cancellationToken);

        return Ok(history);
    }
}
