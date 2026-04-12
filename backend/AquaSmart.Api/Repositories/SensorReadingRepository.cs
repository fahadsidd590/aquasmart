using AquaSmart.Api.Configuration;
using AquaSmart.Api.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace AquaSmart.Api.Repositories;

public sealed class SensorReadingRepository : ISensorReadingRepository
{
    private readonly IMongoCollection<SensorReading> _collection;

    public SensorReadingRepository(IOptions<MongoDbSettings> settings)
    {
        var mongoSettings = settings.Value;
        var client = new MongoClient(mongoSettings.ConnectionString);
        var database = client.GetDatabase(mongoSettings.DatabaseName);
        _collection = database.GetCollection<SensorReading>(mongoSettings.ReadingsCollectionName);

        CreateIndexes();
    }

    public async Task<SensorReading> CreateAsync(SensorReading reading, CancellationToken cancellationToken = default)
    {
        await _collection.InsertOneAsync(reading, cancellationToken: cancellationToken);
        return reading;
    }

    public async Task<IReadOnlyList<SensorReading>> GetHistoryAsync(
        string? deviceId,
        string? sensorType,
        DateTime? fromUtc,
        DateTime? toUtc,
        int limit,
        int skip,
        CancellationToken cancellationToken = default)
    {
        var filterBuilder = Builders<SensorReading>.Filter;
        var filters = new List<FilterDefinition<SensorReading>>();

        if (!string.IsNullOrWhiteSpace(deviceId))
        {
            filters.Add(filterBuilder.Eq(x => x.DeviceId, deviceId));
        }

        if (!string.IsNullOrWhiteSpace(sensorType))
        {
            filters.Add(filterBuilder.Eq(x => x.SensorType, sensorType));
        }

        if (fromUtc.HasValue)
        {
            filters.Add(filterBuilder.Gte(x => x.RecordedAtUtc, fromUtc.Value));
        }

        if (toUtc.HasValue)
        {
            filters.Add(filterBuilder.Lte(x => x.RecordedAtUtc, toUtc.Value));
        }

        var filter = filters.Count == 0 ? filterBuilder.Empty : filterBuilder.And(filters);

        return await _collection
            .Find(filter)
            .SortByDescending(x => x.RecordedAtUtc)
            .Skip(skip)
            .Limit(limit)
            .ToListAsync(cancellationToken);
    }

    public async Task<SensorReading?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var filter = Builders<SensorReading>.Filter.Eq(x => x.Id, id);
        return await _collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SensorReading>> GetLatestPerSensorAsync(
        string deviceId,
        CancellationToken cancellationToken = default)
    {
        var readings = await _collection
            .Find(x => x.DeviceId == deviceId)
            .SortByDescending(x => x.RecordedAtUtc)
            .Limit(500)
            .ToListAsync(cancellationToken);

        return readings
            .GroupBy(x => x.SensorType, StringComparer.OrdinalIgnoreCase)
            .Select(g => g.First())
            .OrderBy(x => x.SensorType)
            .ToList();
    }

    private void CreateIndexes()
    {
        var model1 = new CreateIndexModel<SensorReading>(
            Builders<SensorReading>.IndexKeys
                .Ascending(x => x.DeviceId)
                .Ascending(x => x.SensorType)
                .Descending(x => x.RecordedAtUtc));

        var model2 = new CreateIndexModel<SensorReading>(
            Builders<SensorReading>.IndexKeys.Descending(x => x.RecordedAtUtc));

        _collection.Indexes.CreateMany([model1, model2]);
    }
}
