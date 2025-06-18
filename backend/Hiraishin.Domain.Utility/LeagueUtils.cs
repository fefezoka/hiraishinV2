namespace Hiraishin.Domain.Utility;

public static class LeagueUtils
{
    private static readonly Dictionary<string, int> BaseLeaguePoints = new(StringComparer.OrdinalIgnoreCase)
    {
        { "SILVER", 0 },
        { "GOLD", 400 },
        { "PLATINUM", 800 },
        { "EMERALD", 1200 },
        { "DIAMOND", 1600 },
        { "MASTER", 2000 }
    };

    private static readonly List<string> Ranks = new() { "IV", "III", "II", "I" };

    public static int GetTotalLp(string tier, string rank, int leaguePoints)
    {
        if (!BaseLeaguePoints.TryGetValue(tier, out int tierLp))
            return 0;

        int rankIndex = tierLp >= 2000 ? 0 : Ranks.IndexOf(rank);

        if (rankIndex < 0)
            return 0;

        return tierLp + (rankIndex * 100) + leaguePoints;
    }
}