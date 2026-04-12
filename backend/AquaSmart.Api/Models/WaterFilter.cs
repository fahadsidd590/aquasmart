using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AquaSmart.Api.Models;

public sealed class WaterFilter
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("userId")]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("brand")]
    public string? Brand { get; set; }

    [BsonElement("model")]
    public string? Model { get; set; }

    [BsonElement("serialNumber")]
    public string? SerialNumber { get; set; }

    [BsonElement("installDateUtc")]
    public DateTime InstallDateUtc { get; set; }

    [BsonElement("expireDateUtc")]
    public DateTime ExpireDateUtc { get; set; }

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;

    [BsonElement("notes")]
    public string? Notes { get; set; }

    [BsonElement("createdAtUtc")]
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAtUtc")]
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    [BsonElement("createdByAdminId")]
    public string? CreatedByAdminId { get; set; }
}
