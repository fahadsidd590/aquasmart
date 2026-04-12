using AquaSmart.Api.Models;

namespace AquaSmart.Api.Repositories;

public interface IUserRepository
{
    Task<AppUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<AppUser?> GetByIdAsync(string id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AppUser>> GetAllAsync(int limit, int skip, CancellationToken cancellationToken = default);

    Task<AppUser> CreateAsync(AppUser user, CancellationToken cancellationToken = default);

    Task UpdateAsync(AppUser user, CancellationToken cancellationToken = default);

    Task<long> CountAsync(string? role, bool? isActive, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AppUser>> GetPagedAsync(
        string? role,
        bool? isActive,
        int skip,
        int limit,
        CancellationToken cancellationToken = default);
}
