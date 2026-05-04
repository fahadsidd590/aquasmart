using AquaSmart.Api.Authorization;
using AquaSmart.Api.Configuration;
using AquaSmart.Api.Dtos;
using AquaSmart.Api.Models;
using AquaSmart.Api.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace AquaSmart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class SystemController(
    IUserRepository userRepository,
    IOptions<BootstrapSettings> bootstrapOptions) : ControllerBase
{
    private readonly BootstrapSettings _bootstrap = bootstrapOptions.Value;
    private readonly PasswordHasher<AppUser> _passwordHasher = new();

    /// <summary>One-time setup when no SuperAdmin exists yet. Disable in production after use.</summary>
    [HttpPost("bootstrap")]
    public async Task<ActionResult<UserResponse>> Bootstrap(
        [FromBody] BootstrapRequest request,
        CancellationToken cancellationToken)
    {
        if (!_bootstrap.Enabled || string.IsNullOrWhiteSpace(_bootstrap.SecretKey))
        {
            return NotFound();
        }

        if (!string.Equals(request.SecretKey, _bootstrap.SecretKey, StringComparison.Ordinal))
        {
            return Unauthorized(new { message = "Invalid bootstrap secret." });
        }

        var existingAdmins = await userRepository.CountAsync(Roles.SuperAdmin, null, cancellationToken);
        if (existingAdmins > 0)
        {
            return BadRequest(new { message = "Bootstrap already completed (SuperAdmin exists)." });
        }

        var email = request.Email.Trim();
        var dup = await userRepository.GetByEmailAsync(email, cancellationToken);
        if (dup is not null)
        {
            return Conflict(new { message = "Email already exists." });
        }

        var user = new AppUser
        {
            Name = request.Name.Trim(),
            Email = email,
            EmailNormalized = email.ToUpperInvariant(),
            Role = Roles.SuperAdmin,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        var created = await userRepository.CreateAsync(user, cancellationToken);
        return Ok(new UserResponse
        {
            Id = created.Id ?? string.Empty,
            Name = created.Name,
            Email = created.Email,
            Role = created.Role,
            IsActive = created.IsActive,
            AreaId = created.AreaId <= 0 ? 1 : created.AreaId,
            CreatedAtUtc = created.CreatedAtUtc,
            LastLoginAtUtc = created.LastLoginAtUtc
        });
    }
}
