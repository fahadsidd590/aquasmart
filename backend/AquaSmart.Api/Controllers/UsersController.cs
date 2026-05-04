using AquaSmart.Api.Authorization;
using AquaSmart.Api.Dtos;
using AquaSmart.Api.Models;
using AquaSmart.Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AquaSmart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin}")]
public sealed class UsersController(IUserRepository userRepository) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserResponse>>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(page, 1);
        pageSize = pageSize is < 1 or > 1000 ? 100 : pageSize;

        var users = await userRepository.GetAllAsync(
            pageSize,
            (page - 1) * pageSize,
            cancellationToken);

        return Ok(users.Select(ToResponse).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponse>> GetById(string id, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken);
        return user is null ? NotFound() : Ok(ToResponse(user));
    }

    private static UserResponse ToResponse(AppUser user) => new()
    {
        Id = user.Id ?? string.Empty,
        Name = user.Name,
        Email = user.Email,
        Role = user.Role,
        IsActive = user.IsActive,
        AreaId = user.AreaId <= 0 ? 1 : user.AreaId,
        CreatedAtUtc = user.CreatedAtUtc,
        LastLoginAtUtc = user.LastLoginAtUtc
    };
}
