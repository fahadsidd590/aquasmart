namespace AquaSmart.Api.Dtos;

public sealed class MeFilterHistoryItemDto
{
    public string Id { get; set; } = string.Empty;

    public string FilterId { get; set; } = string.Empty;

    public string Action { get; set; } = string.Empty;

    public string? Details { get; set; }

    public DateTime AtUtc { get; set; }
}
