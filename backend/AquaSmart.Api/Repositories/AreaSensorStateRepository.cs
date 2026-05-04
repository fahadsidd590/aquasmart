using AquaSmart.Api.Configuration;
using AquaSmart.Api.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace AquaSmart.Api.Repositories;

public sealed class AreaSensorStateRepository : IAreaSensorStateRepository
{
    private readonly IMongoCollection<AreaSensorState> _collection;

    public AreaSensorStateRepository(IOptions<MongoDbSettings> settings)
    {
        var mongoSettings = settings.Value;
        var client = new MongoClient(mongoSettings.ConnectionString);
        var database = client.GetDatabase(mongoSettings.DatabaseName);
        _collection = database.GetCollection<AreaSensorState>(mongoSettings.AreaSensorStateCollectionName);

        var uniqueAreaIdIndex = new CreateIndexModel<AreaSensorState>(
            Builders<AreaSensorState>.IndexKeys.Ascending(x => x.AreaId),
            new CreateIndexOptions { Unique = true });
        _collection.Indexes.CreateOne(uniqueAreaIdIndex);
    }

    public async Task<AreaSensorState> UpsertAsync(AreaSensorState state, CancellationToken cancellationToken = default)
    {
        var normalizedAreaId = state.AreaId <= 0 ? 1 : state.AreaId;
        state.AreaId = normalizedAreaId;
        state.UpdatedAtUtc = DateTime.UtcNow;

        var filter = Builders<AreaSensorState>.Filter.Eq(x => x.AreaId, normalizedAreaId);
        var options = new FindOneAndReplaceOptions<AreaSensorState>
        {
            IsUpsert = true,
            ReturnDocument = ReturnDocument.After
        };

        return await _collection.FindOneAndReplaceAsync(filter, state, options, cancellationToken);
    }

    public async Task<AreaSensorState?> GetByAreaIdAsync(int areaId, CancellationToken cancellationToken = default)
    {
        var normalizedAreaId = areaId <= 0 ? 1 : areaId;
        return await _collection
            .Find(x => x.AreaId == normalizedAreaId)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
