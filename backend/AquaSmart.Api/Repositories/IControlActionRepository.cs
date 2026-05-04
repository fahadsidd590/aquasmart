using AquaSmart.Api.Models;

namespace AquaSmart.Api.Repositories;

public interface IControlActionRepository
{
    Task<ControlActionLog> CreateAsync(ControlActionLog action, CancellationToken cancellationToken = default);

    Task<ControlActionLog?> GetLatestAsync(string? deviceId = null, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ControlActionLog>> GetHistoryAsync(
        string? deviceId,
        int limit,
        int skip,
        CancellationToken cancellationToken = default);
}
