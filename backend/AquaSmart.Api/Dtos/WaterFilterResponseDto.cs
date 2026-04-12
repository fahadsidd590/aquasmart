namespace AquaSmart.Api.Dtos;

public sealed class WaterFilterResponseDto
{
    public string Id { get; set; } = string.Empty;

    public string UserId { get; set; } = string.Empty;

    public string? UserEmail { get; set; }

    public string? UserName { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Brand { get; set; }

    public string? Model { get; set; }

    public string? SerialNumber { get; set; }

    public DateTime InstallDateUtc { get; set; }

    public DateTime ExpireDateUtc { get; set; }

    public bool IsActive { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public string Status { get; set; } = string.Empty;
}
