using AquaSmart.Api.Authorization;
using AquaSmart.Api.Dtos;
using AquaSmart.Api.Helpers;
using AquaSmart.Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AquaSmart.Api.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin}")]
public sealed class AdminDashboardController(
    IUserRepository userRepository,
    IWaterFilterRepository waterFilterRepository) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<AdminDashboardDto>> Get(CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var soon = now.AddDays(1);

        var totalAppUsers = await userRepository.CountAsync(Roles.User, null, cancellationToken);
        var activeAppUsers = await userRepository.CountAsync(Roles.User, true, cancellationToken);

        var totalFilters = await waterFilterRepository.CountAllAsync(cancellationToken);
        var activeFilters = await waterFilterRepository.CountActiveAsync(cancellationToken);
        var expiring = await waterFilterRepository.CountActiveExpiringBetweenAsync(now, soon, cancellationToken);
        var expired = await waterFilterRepository.CountActiveExpiredAsync(now, cancellationToken);

        var tableFilters = await waterFilterRepository.GetActiveForDashboardTableAsync(now, 7, 50, cancellationToken);
        var rows = new List<AdminFilterExpiryRowDto>();

        foreach (var f in tableFilters)
        {
            var u = await userRepository.GetByIdAsync(f.UserId, cancellationToken);
            var status = FilterStatusHelper.GetStatus(f.ExpireDateUtc, f.IsActive);
            rows.Add(new AdminFilterExpiryRowDto
            {
                FilterId = f.Id ?? string.Empty,
                FilterName = f.Name,
                UserId = f.UserId,
                UserEmail = u?.Email ?? "",
                UserName = u?.Name ?? "",
                ExpireDateUtc = f.ExpireDateUtc,
                IsActive = f.IsActive,
                Status = status
            });
        }

        return Ok(new AdminDashboardDto
        {
            TotalAppUsers = totalAppUsers,
            ActiveAppUsers = activeAppUsers,
            TotalFilters = totalFilters,
            ActiveFilters = activeFilters,
            ExpiringWithin24Hours = expiring,
            Expired = expired,
            UpcomingAndExpiredFilters = rows
        });
    }
}
