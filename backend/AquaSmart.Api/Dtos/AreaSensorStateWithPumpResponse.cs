using AquaSmart.Api.Models;

namespace AquaSmart.Api.Dtos;

public sealed class AreaSensorStateWithPumpResponse
{
    public AreaSensorState Data { get; set; } = new();

    /// <summary>
    /// 1 = pump ON, 0 = pump OFF.
    /// </summary>
    public int PumpData { get; set; }
}
