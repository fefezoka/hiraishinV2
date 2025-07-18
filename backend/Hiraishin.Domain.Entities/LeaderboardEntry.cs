using Hiraishin.Domain.Dto.Hiraishin;

namespace Hiraishin.Domain.Entities;

public class LeaderboardEntry
{
    public int Id { get; set; }
    public string Puuid { get; set; }
    public DateTime Day { get; set; }
    public string QueueType { get; set; }
    public string Tier { get; set; }
    public string Rank { get; set; }
    public int LeaguePoints { get; set; }
    public int TotalLP { get; set; }
    public int Index { get; set; }
    public int Wins { get; set; }
    public int Losses { get; set; }
    public DateTime? ArrivedOnTop { get; set; }
    public virtual List<Match> Matches { get; set; }
}