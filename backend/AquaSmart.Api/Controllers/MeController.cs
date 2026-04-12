using System.Security.Claims;
using AquaSmart.Api.Dtos;
using AquaSmart.Api.Helpers;
using AquaSmart.Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AquaSmart.Api.Controllers;

[ApiController]
[Route("api/me")]
[Authorize]
public sealed class MeController(
    IWaterFilterRepository waterFilterRepository,
    IUserRepository userRepository,
    IFilterHistoryRepository filterHistoryRepository) : ControllerBase
{
    [HttpGet("filters")]
    public async Task<ActionResult<IReadOnlyList<WaterFilterResponseDto>>> GetMyFilters(
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var me = await userRepository.GetByIdAsync(userId, cancellationToken);
        if (me is null)
        {
            return Unauthorized();
        }

        var filters = await waterFilterRepository.GetByUserIdAsync(userId, activeOnly: false, cancellationToken);
        var list = new List<WaterFilterResponseDto>();

        foreach (var f in filters)
        {
            list.Add(new WaterFilterResponseDto
            {
                Id = f.Id ?? string.Empty,
                UserId = f.UserId,
                UserEmail = me.Email,
                UserName = me.Name,
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
            });
        }

        return Ok(list);
    }

    [HttpGet("filter-alert")]
    public async Task<ActionResult<MeFilterAlertDto>> GetFilterAlert(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var filters = await waterFilterRepository.GetByUserIdAsync(userId, activeOnly: true, cancellationToken);
        var rows = new List<MeFilterRowDto>();
        foreach (var f in filters)
        {
            var st = FilterStatusHelper.GetStatus(f.ExpireDateUtc, f.IsActive);
            rows.Add(new MeFilterRowDto
            {
                Id = f.Id ?? string.Empty,
                Name = f.Name,
                ExpireDateUtc = f.ExpireDateUtc,
                Status = st
            });
        }

        var overall = FilterStatusHelper.GetOverallStatus(rows.Select(r => r.Status));
        var dto = new MeFilterAlertDto
        {
            OverallStatus = overall,
            Message = FilterStatusHelper.GetOverallMessage(overall),
            Filters = rows
        };

        return Ok(dto);
    }

    [HttpGet("filter-history")]
    public async Task<ActionResult<IReadOnlyList<MeFilterHistoryItemDto>>> GetMyFilterHistory(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        page = Math.Max(page, 1);
        pageSize = pageSize is < 1 or > 200 ? 50 : pageSize;

        var entries = await filterHistoryRepository.GetByUserIdAsync(
            userId,
            (page - 1) * pageSize,
            pageSize,
            cancellationToken);

        var list = entries.Select(e => new MeFilterHistoryItemDto
        {
            Id = e.Id ?? string.Empty,
            FilterId = e.FilterId,
            Action = e.Action,
            Details = e.Details,
            AtUtc = e.AtUtc
        }).ToList();

        return Ok(list);
    }
}
