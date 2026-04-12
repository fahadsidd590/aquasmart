namespace AquaSmart.Api.Helpers;

public static class FilterStatusHelper
{
    public const string Ok = "Ok";

    public const string ExpiringSoon = "ExpiringSoon";

    public const string ExpiredNeedChange = "ExpiredNeedChange";

    public const string Inactive = "Inactive";

    public static string GetStatus(DateTime expireUtc, bool isActive)
    {
        if (!isActive)
        {
            return Inactive;
        }

        var now = DateTime.UtcNow;
        if (expireUtc <= now)
        {
            return ExpiredNeedChange;
        }

        if (expireUtc <= now.AddDays(1))
        {
            return ExpiringSoon;
        }

        return Ok;
    }

    public static string GetOverallStatus(IEnumerable<string> filterStatuses)
    {
        var list = filterStatuses.ToList();
        if (list.Count == 0)
        {
            return "None";
        }

        if (list.Any(s => s == ExpiredNeedChange))
        {
            return ExpiredNeedChange;
        }

        if (list.Any(s => s == ExpiringSoon))
        {
            return ExpiringSoon;
        }

        if (list.Any(s => s == Ok))
        {
            return Ok;
        }

        return "None";
    }

    public static string GetOverallMessage(string overall)
    {
        return overall switch
        {
            ExpiredNeedChange => "One or more filters have expired. Please replace them.",
            ExpiringSoon => "A filter will expire within 24 hours. Plan a replacement soon.",
            Ok => "Your water filters are within valid dates.",
            "None" => "No active filters assigned.",
            _ => "No active filters assigned."
        };
    }
}
