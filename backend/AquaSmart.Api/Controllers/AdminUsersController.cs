using AquaSmart.Api.Authorization;
using AquaSmart.Api.Dtos;
using AquaSmart.Api.Models;
using AquaSmart.Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AquaSmart.Api.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin}")]
public sealed class AdminUsersController(IUserRepository userRepository) : ControllerBase
{
    private readonly PasswordHasher<AppUser> _passwordHasher = new();

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserResponse>>> List(
        [FromQuery] string? role,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(page, 1);
        pageSize = pageSize is < 1 or > 500 ? 50 : pageSize;

        var users = await userRepository.GetPagedAsync(
            string.IsNullOrWhiteSpace(role) ? null : role.Trim(),
            isActive,
            (page - 1) * pageSize,
            pageSize,
            cancellationToken);

        return Ok(users.Select(ToResponse).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<UserResponse>> Create(
        [FromBody] AdminCreateUserRequest request,
        CancellationToken cancellationToken)
    {
        var role = string.IsNullOrWhiteSpace(request.Role) ? Roles.User : request.Role.Trim();
        if (string.Equals(role, Roles.SuperAdmin, StringComparison.OrdinalIgnoreCase)
            && !User.IsInRole(Roles.SuperAdmin))
        {
            return Forbid();
        }

        var email = request.Email.Trim();
        var existing = await userRepository.GetByEmailAsync(email, cancellationToken);
        if (existing is not null)
        {
            return Conflict(new { message = "Email already exists." });
        }

        var user = new AppUser
        {
            Name = request.Name.Trim(),
            Email = email,
            EmailNormalized = email.ToUpperInvariant(),
            Role = role,
            IsActive = request.IsActive,
            AreaId = request.AreaId.GetValueOrDefault(),
            CreatedAtUtc = DateTime.UtcNow
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        var created = await userRepository.CreateAsync(user, cancellationToken);
        return CreatedAtAction(nameof(List), new { id = created.Id }, ToResponse(created));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserResponse>> Update(
        string id,
        [FromBody] AdminUpdateUserRequest request,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            user.Name = request.Name.Trim();
        }

        if (request.IsActive.HasValue)
        {
            user.IsActive = request.IsActive.Value;
        }

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            var newRole = request.Role.Trim();
            if (string.Equals(newRole, Roles.SuperAdmin, StringComparison.OrdinalIgnoreCase)
                && !User.IsInRole(Roles.SuperAdmin))
            {
                return Forbid();
            }

            user.Role = newRole;
        }

        if (request.AreaId.HasValue)
        {
            user.AreaId = request.AreaId.Value <= 0 ? 1 : request.AreaId.Value;
        }

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
        }

        await userRepository.UpdateAsync(user, cancellationToken);
        return Ok(ToResponse(user));
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
