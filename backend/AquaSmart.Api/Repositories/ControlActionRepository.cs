using System.Globalization;
using AquaSmart.Api.Configuration;
using AquaSmart.Api.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace AquaSmart.Api.Repositories;

public sealed class ControlActionRepository : IControlActionRepository
{
    private readonly IMongoCollection<ControlActionLog> _collection;

    public ControlActionRepository(IOptions<MongoDbSettings> settings)
    {
        var mongoSettings = settings.Value;
        var client = new MongoClient(mongoSettings.ConnectionString);
        var database = client.GetDatabase(mongoSettings.DatabaseName);
        _collection = database.GetCollection<ControlActionLog>(mongoSettings.ControlActionsCollectionName);
    }

    public async Task<ControlActionLog> CreateAsync(ControlActionLog action, CancellationToken cancellationToken = default)
    {
        await _collection.InsertOneAsync(action, cancellationToken: cancellationToken);
        return action;
    }

    public async Task<ControlActionLog?> GetLatestAsync(string? deviceId = null, CancellationToken cancellationToken = default)
    {
        var filter = string.IsNullOrWhiteSpace(deviceId)
            ? Builders<ControlActionLog>.Filter.Empty
            : Builders<ControlActionLog>.Filter.Eq(x => x.DeviceId, deviceId.Trim());

        return await _collection
            .Find(filter)
            .SortByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ControlActionLog?> GetLatestForPumpAsync(int areaId, CancellationToken cancellationToken = default)
    {
        var key = areaId <= 0 ? "1" : areaId.ToString(CultureInfo.InvariantCulture);
        var filterKey = Builders<ControlActionLog>.Filter.Eq(x => x.DeviceId, key);
        var latest = await _collection
            .Find(filterKey)
            .SortByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);

        if (latest is null && key != "1")
        {
            var filterOne = Builders<ControlActionLog>.Filter.Eq(x => x.DeviceId, "1");
            latest = await _collection
                .Find(filterOne)
                .SortByDescending(x => x.CreatedAtUtc)
                .FirstOrDefaultAsync(cancellationToken);
        }

        if (latest is null)
        {
            latest = await _collection
                .Find(Builders<ControlActionLog>.Filter.Empty)
                .SortByDescending(x => x.CreatedAtUtc)
                .FirstOrDefaultAsync(cancellationToken);
        }

        return latest;
    }

    public async Task<IReadOnlyList<ControlActionLog>> GetHistoryAsync(
        string? deviceId,
        int limit,
        int skip,
        CancellationToken cancellationToken = default)
    {
        var filter = string.IsNullOrWhiteSpace(deviceId)
            ? Builders<ControlActionLog>.Filter.Empty
            : Builders<ControlActionLog>.Filter.Eq(x => x.DeviceId, deviceId);

        return await _collection
            .Find(filter)
            .SortByDescending(x => x.CreatedAtUtc)
            .Skip(skip)
            .Limit(limit)
            .ToListAsync(cancellationToken);
    }
}
