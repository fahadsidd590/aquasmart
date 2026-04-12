using AquaSmart.Api.Configuration;
using AquaSmart.Api.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace AquaSmart.Api.Repositories;

public sealed class FilterHistoryRepository : IFilterHistoryRepository
{
    private readonly IMongoCollection<FilterHistoryEntry> _collection;

    public FilterHistoryRepository(IOptions<MongoDbSettings> settings)
    {
        var mongoSettings = settings.Value;
        var client = new MongoClient(mongoSettings.ConnectionString);
        var database = client.GetDatabase(mongoSettings.DatabaseName);
        _collection = database.GetCollection<FilterHistoryEntry>(mongoSettings.FilterHistoryCollectionName);

        _collection.Indexes.CreateOne(
            new CreateIndexModel<FilterHistoryEntry>(
                Builders<FilterHistoryEntry>.IndexKeys
                    .Ascending(x => x.FilterId)
                    .Descending(x => x.AtUtc)));
        _collection.Indexes.CreateOne(
            new CreateIndexModel<FilterHistoryEntry>(
                Builders<FilterHistoryEntry>.IndexKeys
                    .Ascending(x => x.UserId)
                    .Descending(x => x.AtUtc)));
    }

    public async Task AppendAsync(FilterHistoryEntry entry, CancellationToken cancellationToken = default)
    {
        await _collection.InsertOneAsync(entry, cancellationToken: cancellationToken);
    }

    public async Task<IReadOnlyList<FilterHistoryEntry>> GetByFilterIdAsync(
        string filterId,
        int skip,
        int limit,
        CancellationToken cancellationToken = default)
    {
        return await _collection
            .Find(x => x.FilterId == filterId)
            .SortByDescending(x => x.AtUtc)
            .Skip(skip)
            .Limit(limit)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FilterHistoryEntry>> GetByUserIdAsync(
        string userId,
        int skip,
        int limit,
        CancellationToken cancellationToken = default)
    {
        return await _collection
            .Find(x => x.UserId == userId)
            .SortByDescending(x => x.AtUtc)
            .Skip(skip)
            .Limit(limit)
            .ToListAsync(cancellationToken);
    }
}
