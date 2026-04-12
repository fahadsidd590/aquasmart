using AquaSmart.Api.Configuration;
using AquaSmart.Api.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace AquaSmart.Api.Repositories;

public sealed class SettingsRepository : ISettingsRepository
{
    private readonly IMongoCollection<DeviceSettings> _collection;

    public SettingsRepository(IOptions<MongoDbSettings> settings)
    {
        var mongoSettings = settings.Value;
        var client = new MongoClient(mongoSettings.ConnectionString);
        var database = client.GetDatabase(mongoSettings.DatabaseName);
        _collection = database.GetCollection<DeviceSettings>(mongoSettings.SettingsCollectionName);
    }

    public async Task<DeviceSettings> SaveAsync(DeviceSettings settings, CancellationToken cancellationToken = default)
    {
        await _collection.InsertOneAsync(settings, cancellationToken: cancellationToken);
        return settings;
    }

    public async Task<DeviceSettings?> GetLatestAsync(string deviceId, CancellationToken cancellationToken = default)
    {
        return await _collection
            .Find(x => x.DeviceId == deviceId)
            .SortByDescending(x => x.UpdatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<DeviceSettings>> GetHistoryAsync(
        string deviceId,
        int limit,
        int skip,
        CancellationToken cancellationToken = default)
    {
        return await _collection
            .Find(x => x.DeviceId == deviceId)
            .SortByDescending(x => x.UpdatedAtUtc)
            .Skip(skip)
            .Limit(limit)
            .ToListAsync(cancellationToken);
    }
}
