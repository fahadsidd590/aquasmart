namespace AquaSmart.Api.Dtos;

public sealed class LoginResponse
{
    public string Message { get; set; } = "Login successful";

    public UserResponse User { get; set; } = new();

    public string? AccessToken { get; set; }

    public DateTime? AccessTokenExpiresAtUtc { get; set; }
}
