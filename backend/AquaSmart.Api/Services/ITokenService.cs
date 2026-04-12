using AquaSmart.Api.Models;

namespace AquaSmart.Api.Services;

public interface ITokenService
{
    (string Token, DateTime ExpiresAtUtc) CreateAccessToken(AppUser user);
}
