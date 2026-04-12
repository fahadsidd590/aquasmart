using AquaSmart.Api.Configuration;
using AquaSmart.Api.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace AquaSmart.Api.Repositories;

public sealed class WaterFilterRepository : IWaterFilterRepository
{
    private readonly IMongoCollection<WaterFilter> _collection;

    public WaterFilterRepository(IOptions<MongoDbSettings> settings)
    {
        var mongoSettings = settings.Value;
        var client = new MongoClient(mongoSettings.ConnectionString);
        var database = client.GetDatabase(mongoSettings.DatabaseName);
        _collection = database.GetCollection<WaterFilter>(mongoSettings.WaterFiltersCollectionName);

        var idx = new CreateIndexModel<WaterFilter>(
            Builders<WaterFilter>.IndexKeys
                .Ascending(x => x.UserId)
                .Descending(x => x.ExpireDateUtc));
        _collection.Indexes.CreateOne(idx);
    }

    public async Task<WaterFilter> CreateAsync(WaterFilter filter, CancellationToken cancellationToken = default)
    {
        await _collection.InsertOneAsync(filter, cancellationToken: cancellationToken);
        return filter;
    }

    public async Task<WaterFilter?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _collection.Find(x => x.Id == id).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<WaterFilter>> GetByUserIdAsync(
        string userId,
        bool activeOnly,
        CancellationToken cancellationToken = default)
    {
        var builder = Builders<WaterFilter>.Filter;
        var filter = builder.Eq(x => x.UserId, userId);
        if (activeOnly)
        {
            filter &= builder.Eq(x => x.IsActive, true);
        }

        return await _collection
            .Find(filter)
            .SortByDescending(x => x.ExpireDateUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<WaterFilter>> GetPagedAsync(
        string? userId,
        bool? activeOnly,
        int skip,
        int limit,
        CancellationToken cancellationToken = default)
    {
        var builder = Builders<WaterFilter>.Filter;
        var filter = builder.Empty;

        if (!string.IsNullOrWhiteSpace(userId))
        {
            filter &= builder.Eq(x => x.UserId, userId.Trim());
        }

        if (activeOnly.HasValue)
        {
            filter &= builder.Eq(x => x.IsActive, activeOnly.Value);
        }

        return await _collection
            .Find(filter)
            .SortByDescending(x => x.ExpireDateUtc)
            .Skip(skip)
            .Limit(limit)
            .ToListAsync(cancellationToken);
    }

    public async Task UpdateAsync(WaterFilter filter, CancellationToken cancellationToken = default)
    {
        await _collection.ReplaceOneAsync(x => x.Id == filter.Id, filter, cancellationToken: cancellationToken);
    }

    public Task<long> CountAllAsync(CancellationToken cancellationToken = default)
    {
        return _collection.CountDocumentsAsync(Builders<WaterFilter>.Filter.Empty, cancellationToken: cancellationToken);
    }

    public Task<long> CountActiveAsync(CancellationToken cancellationToken = default)
    {
        return _collection.CountDocumentsAsync(
            Builders<WaterFilter>.Filter.Eq(x => x.IsActive, true),
            cancellationToken: cancellationToken);
    }

    public Task<long> CountActiveExpiringBetweenAsync(
        DateTime fromUtc,
        DateTime toUtcExclusive,
        CancellationToken cancellationToken = default)
    {
        var b = Builders<WaterFilter>.Filter;
        var filter = b.Eq(x => x.IsActive, true)
                     & b.Gt(x => x.ExpireDateUtc, fromUtc)
                     & b.Lte(x => x.ExpireDateUtc, toUtcExclusive);
        return _collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
    }

    public Task<long> CountActiveExpiredAsync(DateTime nowUtc, CancellationToken cancellationToken = default)
    {
        var b = Builders<WaterFilter>.Filter;
        var filter = b.Eq(x => x.IsActive, true) & b.Lte(x => x.ExpireDateUtc, nowUtc);
        return _collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
    }

    public async Task<IReadOnlyList<WaterFilter>> GetActiveForDashboardTableAsync(
        DateTime nowUtc,
        int daysAhead,
        int limit,
        CancellationToken cancellationToken = default)
    {
        var b = Builders<WaterFilter>.Filter;
        var until = nowUtc.AddDays(daysAhead);
        var filter = b.Eq(x => x.IsActive, true)
                     & (b.Lte(x => x.ExpireDateUtc, until) | b.Lte(x => x.ExpireDateUtc, nowUtc));

        return await _collection
            .Find(filter)
            .SortBy(x => x.ExpireDateUtc)
            .Limit(limit)
            .ToListAsync(cancellationToken);
    }
}
