namespace AquaSmart.Api.Configuration;

public sealed class MongoDbSettings
{
    public const string SectionName = "MongoDb";

    public string ConnectionString { get; set; } = "mongodb://localhost:27017";

    public string DatabaseName { get; set; } = "aquasmart";

    public string ReadingsCollectionName { get; set; } = "sensor_readings";

    public string SettingsCollectionName { get; set; } = "device_settings";

    public string ControlActionsCollectionName { get; set; } = "control_actions";

    public string UsersCollectionName { get; set; } = "users";

    public string WaterFiltersCollectionName { get; set; } = "water_filters";

    public string FilterHistoryCollectionName { get; set; } = "filter_history";

    public string AreaSensorStateCollectionName { get; set; } = "area_sensor_state";
}
