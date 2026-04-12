namespace AquaSmart.Api.Configuration;

public sealed class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "AquaSmart";

    public string Audience { get; set; } = "AquaSmartClients";

    /// <summary>Symmetric key for HS256. Must be at least 32 characters.</summary>
    public string SecretKey { get; set; } =
        "CHANGE_ME_TO_A_LONG_RANDOM_SECRET_KEY_32PLUS";

    public int ExpiryMinutes { get; set; } = 10080; // 7 days
}
