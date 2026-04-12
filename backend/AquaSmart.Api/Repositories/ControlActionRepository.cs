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
