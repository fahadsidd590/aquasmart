using AquaSmart.Api.Models;

namespace AquaSmart.Api.Repositories;

public interface IFilterHistoryRepository
{
    Task AppendAsync(FilterHistoryEntry entry, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<FilterHistoryEntry>> GetByFilterIdAsync(
        string filterId,
        int skip,
        int limit,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<FilterHistoryEntry>> GetByUserIdAsync(
        string userId,
        int skip,
        int limit,
        CancellationToken cancellationToken = default);
}
