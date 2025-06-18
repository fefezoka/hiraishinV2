using System;

namespace Hiraishin.Domain.Entities;

public enum QueueType
{
    Solo,
    Flex
}

public class WeeklyRanking
{
    public int Id { get; set; }
    public string AccountId { get; set; }
    public DateTime WeekStart { get; set; }
    public QueueType QueueType { get; set; }
    public string Tier { get; set; }
    public string Rank { get; set; }
    public int LeaguePoints { get; set; }
    public int TotalLP { get; set; }

    public static int GetTotalLp(WeeklyRanking elo)
    {
        Dictionary<string, int> BaseLeaguePoints =
        new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
        {
            {"SILVER", 0},
            {"GOLD", 400},
            {"PLATINUM", 800},
            {"EMERALD", 1200},
            {"DIAMOND", 1600},
            {"MASTER", 2000},
        };

        List<string> Ranks = new List<string> { "IV", "III", "II", "I" };

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

        return tierLp + (RankIndex * 100) + elo.LeaguePoints;
    }
}