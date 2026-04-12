using AquaSmart.Api.Models;

namespace AquaSmart.Api.Repositories;

public interface IWaterFilterRepository
{
    Task<WaterFilter> CreateAsync(WaterFilter filter, CancellationToken cancellationToken = default);

    Task<WaterFilter?> GetByIdAsync(string id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<WaterFilter>> GetByUserIdAsync(string userId, bool activeOnly, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<WaterFilter>> GetPagedAsync(
        string? userId,
        bool? activeOnly,
        int skip,
        int limit,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(WaterFilter filter, CancellationToken cancellationToken = default);

    Task<long> CountAllAsync(CancellationToken cancellationToken = default);

    Task<long> CountActiveAsync(CancellationToken cancellationToken = default);

    Task<long> CountActiveExpiringBetweenAsync(
        DateTime fromUtc,
        DateTime toUtcExclusive,
        CancellationToken cancellationToken = default);

    Task<long> CountActiveExpiredAsync(DateTime nowUtc, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<WaterFilter>> GetActiveForDashboardTableAsync(
        DateTime nowUtc,
        int daysAhead,
        int limit,
        CancellationToken cancellationToken = default);
}
