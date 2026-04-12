namespace AquaSmart.Api.Dtos;

public sealed class QualityOverviewDto
{
    public string DeviceId { get; set; } = string.Empty;

    public string OverallStatus { get; set; } = "Unknown";

    public string Description { get; set; } = string.Empty;

    public string DecisionTitle { get; set; } = string.Empty;

    public string DecisionDescription { get; set; } = string.Empty;

    public string UseRecommendation { get; set; } = string.Empty;

    public List<QualityMetricDto> Metrics { get; set; } = [];
}

public sealed class QualityMetricDto
{
    public string Label { get; set; } = string.Empty;

    public string SensorType { get; set; } = string.Empty;

    public string Value { get; set; } = string.Empty;

    public string Status { get; set; } = "Unknown";
}
