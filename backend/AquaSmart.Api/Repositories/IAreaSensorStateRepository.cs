using AquaSmart.Api.Models;

namespace AquaSmart.Api.Repositories;

public interface IAreaSensorStateRepository
{
    Task<AreaSensorState> UpsertAsync(AreaSensorState state, CancellationToken cancellationToken = default);

    Task<AreaSensorState?> GetByAreaIdAsync(int areaId, CancellationToken cancellationToken = default);
}
