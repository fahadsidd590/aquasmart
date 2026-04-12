using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AquaSmart.Api.Models;

public sealed class DeviceSettings
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("deviceId")]
    public string DeviceId { get; set; } = string.Empty;

    [BsonElement("autoFill")]
    public bool AutoFill { get; set; }

    [BsonElement("smartScheduling")]
    public bool SmartScheduling { get; set; }

    [BsonElement("overflowProtection")]
    public bool OverflowProtection { get; set; }

    [BsonElement("lowTankAlert")]
    public bool LowTankAlert { get; set; }

    [BsonElement("poorQualityAlert")]
    public bool PoorQualityAlert { get; set; }

    [BsonElement("filterMaintenanceAlert")]
    public bool FilterMaintenanceAlert { get; set; }

    [BsonElement("updatedAtUtc")]
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
