using AquaSmart.Api.Models;

namespace AquaSmart.Api.Repositories;

public interface ISettingsRepository
{
    Task<DeviceSettings> SaveAsync(DeviceSettings settings, CancellationToken cancellationToken = default);

    Task<DeviceSettings?> GetLatestAsync(string deviceId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<DeviceSettings>> GetHistoryAsync(
        string deviceId,
        int limit,
        int skip,
        CancellationToken cancellationToken = default);
}
