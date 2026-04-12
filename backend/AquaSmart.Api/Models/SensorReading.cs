using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AquaSmart.Api.Models;

public sealed class SensorReading
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("deviceId")]
    public string DeviceId { get; set; } = string.Empty;

    [BsonElement("sensorType")]
    public string SensorType { get; set; } = string.Empty;

    [BsonElement("value")]
    public double Value { get; set; }

    [BsonElement("unit")]
    public string Unit { get; set; } = string.Empty;

    [BsonElement("status")]
    public string? Status { get; set; }

    [BsonElement("metadata")]
    public Dictionary<string, string>? Metadata { get; set; }

    [BsonElement("recordedAtUtc")]
    public DateTime RecordedAtUtc { get; set; } = DateTime.UtcNow;

    [BsonElement("receivedAtUtc")]
    public DateTime ReceivedAtUtc { get; set; } = DateTime.UtcNow;
}
