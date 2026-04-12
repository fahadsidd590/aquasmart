using AquaSmart.Api.Models;

namespace AquaSmart.Api.Repositories;

public interface ISensorReadingRepository
{
    Task<SensorReading> CreateAsync(SensorReading reading, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SensorReading>> GetHistoryAsync(
        string? deviceId,
        string? sensorType,
        DateTime? fromUtc,
        DateTime? toUtc,
        int limit,
        int skip,
        CancellationToken cancellationToken = default);

    Task<SensorReading?> GetByIdAsync(string id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SensorReading>> GetLatestPerSensorAsync(
        string deviceId,
        CancellationToken cancellationToken = default);
}
