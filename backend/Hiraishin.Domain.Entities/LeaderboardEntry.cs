namespace Hiraishin.Domain.Entities;

public class LeaderboardEntry
{
    public int Id { get; set; }
    public string Puuid { get; set; }
    public DateTime WeekStart { get; set; }
    public string QueueType { get; set; }
    public string Tier { get; set; }
    public string Rank { get; set; }
    public int LeaguePoints { get; set; }
    public int TotalLP { get; set; }
    public int Index { get; set; }
}