using AquaSmart.Api.Models;

namespace AquaSmart.Api.Repositories;

public interface IControlActionRepository
{
    Task<ControlActionLog> CreateAsync(ControlActionLog action, CancellationToken cancellationToken = default);

    Task<ControlActionLog?> GetLatestAsync(string? deviceId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Latest control row for pump resolution: deviceId matches area id string ("1","2"...).
    /// Falls back to area "1", then to any device (legacy rows).
    /// </summary>
    Task<ControlActionLog?> GetLatestForPumpAsync(int areaId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ControlActionLog>> GetHistoryAsync(
        string? deviceId,
        int limit,
        int skip,
        CancellationToken cancellationToken = default);
}
