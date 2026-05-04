using AquaSmart.Api.Configuration;
using AquaSmart.Api.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace AquaSmart.Api.Repositories;

public sealed class UserRepository : IUserRepository
{
    private readonly IMongoCollection<AppUser> _collection;
    private readonly IMongoCollection<CounterDocument> _counterCollection;

    public UserRepository(IOptions<MongoDbSettings> settings)
    {
        var mongoSettings = settings.Value;
        var client = new MongoClient(mongoSettings.ConnectionString);
        var database = client.GetDatabase(mongoSettings.DatabaseName);
        _collection = database.GetCollection<AppUser>(mongoSettings.UsersCollectionName);
        _counterCollection = database.GetCollection<CounterDocument>("counters");

        var uniqueEmailIndex = new CreateIndexModel<AppUser>(
            Builders<AppUser>.IndexKeys.Ascending(x => x.EmailNormalized),
            new CreateIndexOptions { Unique = true });
        _collection.Indexes.CreateOne(uniqueEmailIndex);
    }

    public async Task<AppUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalized = email.Trim().ToUpperInvariant();
        return await _collection
            .Find(x => x.EmailNormalized == normalized)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<AppUser?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _collection.Find(x => x.Id == id).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AppUser>> GetAllAsync(int limit, int skip, CancellationToken cancellationToken = default)
    {
        return await _collection
            .Find(Builders<AppUser>.Filter.Empty)
            .SortByDescending(x => x.CreatedAtUtc)
            .Skip(skip)
            .Limit(limit)
            .ToListAsync(cancellationToken);
    }

    public async Task<AppUser> CreateAsync(AppUser user, CancellationToken cancellationToken = default)
    {
        if (user.AreaId <= 0)
        {
            user.AreaId = await GetNextAreaIdAsync(cancellationToken);
        }

        await _collection.InsertOneAsync(user, cancellationToken: cancellationToken);
        return user;
    }

    public async Task UpdateAsync(AppUser user, CancellationToken cancellationToken = default)
    {
        await _collection.ReplaceOneAsync(x => x.Id == user.Id, user, cancellationToken: cancellationToken);
    }

    public async Task<long> CountAsync(string? role, bool? isActive, CancellationToken cancellationToken = default)
    {
        var filter = BuildFilter(role, isActive);
        return await _collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
    }

    public async Task<IReadOnlyList<AppUser>> GetPagedAsync(
        string? role,
        bool? isActive,
        int skip,
        int limit,
        CancellationToken cancellationToken = default)
    {
        var filter = BuildFilter(role, isActive);
        return await _collection
            .Find(filter)
            .SortByDescending(x => x.CreatedAtUtc)
            .Skip(skip)
            .Limit(limit)
            .ToListAsync(cancellationToken);
    }

    private static FilterDefinition<AppUser> BuildFilter(string? role, bool? isActive)
    {
        var builder = Builders<AppUser>.Filter;
        var parts = new List<FilterDefinition<AppUser>>();

        if (!string.IsNullOrWhiteSpace(role))
        {
            parts.Add(builder.Eq(x => x.Role, role.Trim()));
        }

        if (isActive.HasValue)
        {
            parts.Add(builder.Eq(x => x.IsActive, isActive.Value));
        }

        return parts.Count == 0 ? builder.Empty : builder.And(parts);
    }

    private async Task<int> GetNextAreaIdAsync(CancellationToken cancellationToken)
    {
        var filter = Builders<CounterDocument>.Filter.Eq(x => x.Id, "areaId");
        var update = Builders<CounterDocument>.Update.Inc(x => x.Sequence, 1);
        var options = new FindOneAndUpdateOptions<CounterDocument>
        {
            IsUpsert = true,
            ReturnDocument = ReturnDocument.After
        };

        var counter = await _counterCollection.FindOneAndUpdateAsync(
            filter,
            update,
            options,
            cancellationToken);

        return counter.Sequence <= 0 ? 1 : counter.Sequence;
    }

    private sealed class CounterDocument
    {
        [MongoDB.Bson.Serialization.Attributes.BsonId]
        public string Id { get; set; } = string.Empty;

        [MongoDB.Bson.Serialization.Attributes.BsonElement("sequence")]
        public int Sequence { get; set; }
    }
}
