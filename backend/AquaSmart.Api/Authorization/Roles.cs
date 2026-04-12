namespace AquaSmart.Api.Authorization;

public static class Roles
{
    public const string SuperAdmin = "SuperAdmin";

    public const string Admin = "Admin";

    public const string User = "User";

    public static bool IsPortalAdmin(string role) =>
        string.Equals(role, SuperAdmin, StringComparison.OrdinalIgnoreCase)
        || string.Equals(role, Admin, StringComparison.OrdinalIgnoreCase);
}
