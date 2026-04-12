namespace AquaSmart.Api.Dtos;

public sealed class MeFilterAlertDto
{
    /// <summary>None, Ok, ExpiringSoon, ExpiredNeedChange</summary>
    public string OverallStatus { get; set; } = "None";

    public string Message { get; set; } = string.Empty;

    public List<MeFilterRowDto> Filters { get; set; } = [];
}

public sealed class MeFilterRowDto
{
    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public DateTime ExpireDateUtc { get; set; }

    /// <summary>Ok, ExpiringSoon, ExpiredNeedChange</summary>
    public string Status { get; set; } = string.Empty;
}
