using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AquaSmart.Api.Models;

public sealed class FilterHistoryEntry
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("filterId")]
    public string FilterId { get; set; } = string.Empty;

    [BsonElement("userId")]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("action")]
    public string Action { get; set; } = string.Empty;

    [BsonElement("details")]
    public string? Details { get; set; }

    [BsonElement("actorUserId")]
    public string? ActorUserId { get; set; }

    [BsonElement("atUtc")]
    public DateTime AtUtc { get; set; } = DateTime.UtcNow;
}
