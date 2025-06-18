namespace Hiraishin.Domain.Entities;

public class RankSemanalModel
{
    public Guid Id { get; set; }
    public String Name { get; set; }
    public String Rank { get; set; }
    public String Tier { get; set; }
    public int Pdl { get; set; }
    public int TotaltierLp { get; set; }
}

public static class LolUtils
{
    private static readonly Dictionary<string, int> BaseLeaguePoints =
        new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
        {
            {"SILVER", 0},
            {"GOLDEN", 400},
            {"PLATINUM", 800},
            {"EMERALD", 1200},
            {"DIAMOND", 1600},
            {"MASTER", 2000},
        };

    private static readonly List<string> Ranks = new List<string> { "IV", "III", "II", "I" };

    public static int GetTotalLp(RankSemanalModel elo)
    {
        if (elo == null)
        {
            return 0;
        }

        if (!BaseLeaguePoints.ContainsKey(elo.Tier) || !Ranks.Contains(elo.Rank))
        {
            return 0;
        }
        
        int tierLp = BaseLeaguePoints[elo.Tier];
        int RankIndex = tierLp >= 2000 ? 0 : Ranks.IndexOf(elo.Rank);

        return tierLp + (RankIndex * 100) + elo.Pdl;
    }
}