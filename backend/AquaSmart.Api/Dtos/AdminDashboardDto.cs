namespace AquaSmart.Api.Dtos;

public sealed class AdminDashboardDto
{
    public long TotalAppUsers { get; set; }

    public long ActiveAppUsers { get; set; }

    public long TotalFilters { get; set; }

    public long ActiveFilters { get; set; }

    public long ExpiringWithin24Hours { get; set; }

    public long Expired { get; set; }

    public List<AdminFilterExpiryRowDto> UpcomingAndExpiredFilters { get; set; } = [];
}

public sealed class AdminFilterExpiryRowDto
{
    public string FilterId { get; set; } = string.Empty;

    public string FilterName { get; set; } = string.Empty;

    public string UserId { get; set; } = string.Empty;

    public string UserEmail { get; set; } = string.Empty;

    public string UserName { get; set; } = string.Empty;

    public DateTime ExpireDateUtc { get; set; }

    public bool IsActive { get; set; }

    public string Status { get; set; } = string.Empty;
}
