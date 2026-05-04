using Microsoft.AspNetCore.Identity;

namespace GeneratePasswordHash;

internal sealed class UserStub;

internal static class Program
{
    private static int Main(string[] args)
    {
        var plain = args.Length > 0 ? string.Join(" ", args) : "AquaAdmin!2026";
        var hasher = new PasswordHasher<UserStub>();
        var hash = hasher.HashPassword(new UserStub(), plain);

        Console.WriteLine("Plain password (use this to log in after MongoDB update):");
        Console.WriteLine(plain);
        Console.WriteLine();
        Console.WriteLine("Set field passwordHash (or passwordHash in BSON) to:");
        Console.WriteLine(hash);
        return 0;
    }
}
