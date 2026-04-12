using System.Security.Claims;
using System.Text.Json;
using AquaSmart.Api.Authorization;
using AquaSmart.Api.Dtos;
using AquaSmart.Api.Helpers;
using AquaSmart.Api.Models;
using AquaSmart.Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AquaSmart.Api.Controllers;

[ApiController]
[Route("api/admin/filters")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin}")]
public sealed class AdminFiltersController(
    IWaterFilterRepository waterFilterRepository,
    IFilterHistoryRepository historyRepository,
    IUserRepository userRepository) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<WaterFilterResponseDto>>> List(
        [FromQuery] string? userId,
        [FromQuery] bool? activeOnly,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(page, 1);
        pageSize = pageSize is < 1 or > 500 ? 50 : pageSize;

        var list = await waterFilterRepository.GetPagedAsync(
            string.IsNullOrWhiteSpace(userId) ? null : userId.Trim(),
            activeOnly,
            (page - 1) * pageSize,
            pageSize,
            cancellationToken);

        var result = new List<WaterFilterResponseDto>();
        foreach (var f in list)
        {
            result.Add(await MapAsync(f, cancellationToken));
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<WaterFilterResponseDto>> Create(
        [FromBody] CreateWaterFilterRequest request,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.UserId.Trim(), cancellationToken);
        if (user is null || !user.IsActive || !string.Equals(user.Role, Roles.User, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Filter can only be assigned to an active app user (Role=User)." });
        }

        if (request.ExpireDateUtc <= request.InstallDateUtc)
        {
            return BadRequest(new { message = "Expire date must be after install date." });
        }

        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var entity = new WaterFilter
        {
            UserId = user.Id!,
            Name = request.Name.Trim(),
            Brand = request.Brand?.Trim(),
            Model = request.Model?.Trim(),
            SerialNumber = request.SerialNumber?.Trim(),
            InstallDateUtc = request.InstallDateUtc,
            ExpireDateUtc = request.ExpireDateUtc,
            Notes = request.Notes?.Trim(),
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow,
            CreatedByAdminId = adminId
        };

        var created = await waterFilterRepository.CreateAsync(entity, cancellationToken);
        await historyRepository.AppendAsync(new FilterHistoryEntry
        {
            FilterId = created.Id!,
            UserId = created.UserId,
            Action = "Created",
            Details = JsonSerializer.Serialize(request),
            ActorUserId = adminId,
            AtUtc = DateTime.UtcNow
        }, cancellationToken);

        return CreatedAtAction(nameof(GetHistory), new { id = created.Id }, await MapAsync(created, cancellationToken));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<WaterFilterResponseDto>> Update(
        string id,
        [FromBody] UpdateWaterFilterRequest request,
        CancellationToken cancellationToken)
    {
        var existing = await waterFilterRepository.GetByIdAsync(id, cancellationToken);
        if (existing is null)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            existing.Name = request.Name.Trim();
        }

        if (request.Brand is not null)
        {
            existing.Brand = string.IsNullOrWhiteSpace(request.Brand) ? null : request.Brand.Trim();
        }

        if (request.Model is not null)
        {
            existing.Model = string.IsNullOrWhiteSpace(request.Model) ? null : request.Model.Trim();
        }

        if (request.SerialNumber is not null)
        {
            existing.SerialNumber = string.IsNullOrWhiteSpace(request.SerialNumber) ? null : request.SerialNumber.Trim();
        }

        if (request.InstallDateUtc.HasValue)
        {
            existing.InstallDateUtc = request.InstallDateUtc.Value;
        }

        if (request.ExpireDateUtc.HasValue)
        {
            existing.ExpireDateUtc = request.ExpireDateUtc.Value;
        }

        if (request.IsActive.HasValue)
        {
            existing.IsActive = request.IsActive.Value;
        }

        if (request.Notes is not null)
        {
            existing.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
        }

        if (existing.ExpireDateUtc <= existing.InstallDateUtc)
        {
            return BadRequest(new { message = "Expire date must be after install date." });
        }

        existing.UpdatedAtUtc = DateTime.UtcNow;
        await waterFilterRepository.UpdateAsync(existing, cancellationToken);

        await historyRepository.AppendAsync(new FilterHistoryEntry
        {
            FilterId = existing.Id!,
            UserId = existing.UserId,
            Action = "Updated",
            Details = JsonSerializer.Serialize(request),
            ActorUserId = User.FindFirstValue(ClaimTypes.NameIdentifier),
            AtUtc = DateTime.UtcNow
        }, cancellationToken);

        return Ok(await MapAsync(existing, cancellationToken));
    }

    [HttpGet("{id}/history")]
    public async Task<ActionResult<IReadOnlyList<FilterHistoryEntry>>> GetHistory(
        string id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100,
        CancellationToken cancellationToken = default)
    {
        var f = await waterFilterRepository.GetByIdAsync(id, cancellationToken);
        if (f is null)
        {
            return NotFound();
        }

        page = Math.Max(page, 1);
        pageSize = pageSize is < 1 or > 500 ? 100 : pageSize;

        var history = await historyRepository.GetByFilterIdAsync(id, (page - 1) * pageSize, pageSize, cancellationToken);
        return Ok(history);
    }

    private async Task<WaterFilterResponseDto> MapAsync(WaterFilter f, CancellationToken ct)
    {
        var u = await userRepository.GetByIdAsync(f.UserId, ct);
        return new WaterFilterResponseDto
        {
            Id = f.Id ?? string.Empty,
            UserId = f.UserId,
            UserEmail = u?.Email,
            UserName = u?.Name,
            Name = f.Name,
            Brand = f.Brand,
            Model = f.Model,
            SerialNumber = f.SerialNumber,
            InstallDateUtc = f.InstallDateUtc,
            ExpireDateUtc = f.ExpireDateUtc,
            IsActive = f.IsActive,
            Notes = f.Notes,
            CreatedAtUtc = f.CreatedAtUtc,
            UpdatedAtUtc = f.UpdatedAtUtc,
            Status = FilterStatusHelper.GetStatus(f.ExpireDateUtc, f.IsActive)
        };
    }
}
