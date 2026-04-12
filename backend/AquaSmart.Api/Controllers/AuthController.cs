using AquaSmart.Api.Authorization;
using AquaSmart.Api.Dtos;
using AquaSmart.Api.Models;
using AquaSmart.Api.Repositories;
using AquaSmart.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AquaSmart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController(IUserRepository userRepository, ITokenService tokenService) : ControllerBase
{
    private readonly PasswordHasher<AppUser> _passwordHasher = new();

    [HttpPost("register")]
    public async Task<ActionResult<UserResponse>> Register(
        [FromBody] RegisterUserRequest request,
        CancellationToken cancellationToken)
    {
        var requestedRole = string.IsNullOrWhiteSpace(request.Role) ? Roles.User : request.Role.Trim();
        if (!string.Equals(requestedRole, Roles.User, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Public registration is only allowed for app users (Role=User)." });
        }

        var existing = await userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existing is not null)
        {
            return Conflict(new { message = "Email is already registered." });
        }

        var user = new AppUser
        {
            Name = request.Name.Trim(),
            Email = request.Email.Trim(),
            EmailNormalized = request.Email.Trim().ToUpperInvariant(),
            Role = Roles.User,
            CreatedAtUtc = DateTime.UtcNow,
            IsActive = true
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        var created = await userRepository.CreateAsync(user, cancellationToken);
        return CreatedAtAction(nameof(GetMeById), new { id = created.Id }, ToResponse(created));
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (user is null || !user.IsActive)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var verification = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verification == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        user.LastLoginAtUtc = DateTime.UtcNow;
        await userRepository.UpdateAsync(user, cancellationToken);

        var (token, expires) = tokenService.CreateAccessToken(user);

        return Ok(new LoginResponse
        {
            Message = "Login successful",
            User = ToResponse(user),
            AccessToken = token,
            AccessTokenExpiresAtUtc = expires
        });
    }

    [HttpGet("me/{id}")]
    public async Task<ActionResult<UserResponse>> GetMeById(string id, CancellationToken cancellationToken)
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
        CreatedAtUtc = user.CreatedAtUtc,
        LastLoginAtUtc = user.LastLoginAtUtc
    };
}
