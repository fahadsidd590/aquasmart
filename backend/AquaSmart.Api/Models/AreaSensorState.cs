using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AquaSmart.Api.Models;

public sealed class AreaSensorState
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("areaId")]
    public int AreaId { get; set; } = 1;

    [BsonElement("turbidity")]
    public double Turbidity { get; set; }

    [BsonElement("ph")]
    public double Ph { get; set; }

    [BsonElement("tds")]
    public double Tds { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = string.Empty;

    [BsonElement("cleanValve")]
    public string CleanValve { get; set; } = string.Empty;

    [BsonElement("dirtyValve")]
    public string DirtyValve { get; set; } = string.Empty;

    /// <summary>
    /// "1" = tank full, "0" = not full (from device).
    /// </summary>
    [BsonElement("waterLevel")]
    public string WaterLevel { get; set; } = "0";

    [BsonElement("updatedAtUtc")]
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
