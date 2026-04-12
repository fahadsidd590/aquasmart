namespace AquaSmart.Api.Dtos;

public sealed class UpdateDeviceSettingsRequest
{
    public bool AutoFill { get; set; }

    public bool SmartScheduling { get; set; }

    public bool OverflowProtection { get; set; }

    public bool LowTankAlert { get; set; }

    public bool PoorQualityAlert { get; set; }

    public bool FilterMaintenanceAlert { get; set; }
}
