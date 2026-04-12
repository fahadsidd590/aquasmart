namespace AquaSmart.Api.Configuration;

public sealed class BootstrapSettings
{
    public const string SectionName = "Bootstrap";

    public bool Enabled { get; set; }

    public string SecretKey { get; set; } = string.Empty;
}
