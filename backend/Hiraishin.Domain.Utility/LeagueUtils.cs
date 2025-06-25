namespace Hiraishin.Domain.Utility;

public static class LeagueUtils
{
    private static readonly Dictionary<string, int> BaseLeaguePoints = new(StringComparer.OrdinalIgnoreCase)
    {
        { "IRON", 0 },
        { "BRONZE", 400 },
        { "SILVER", 800 },
        { "GOLD", 1200 },
        { "PLATINUM", 1600 },
        { "EMERALD", 2000 },
        { "DIAMOND", 2400 },
        { "MASTER", 2800 }
    };

    private static readonly List<string> Ranks = new() { "IV", "III", "II", "I" };

    public static int GetTotalLP(string tier, string rank, int leaguePoints)
    {
        if (!BaseLeaguePoints.TryGetValue(tier, out int tierLp))
            return 0;

        int rankIndex = tierLp >= 2000 ? 0 : Ranks.IndexOf(rank);

        if (rankIndex < 0)
            return 0;

        return tierLp + (rankIndex * 100) + leaguePoints;
    }
}