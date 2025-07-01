using Hiraishin.Domain.Entities;

namespace Hiraishin.Domain.Dto.Hiraishin;

public class Match
{
    public int Id { get; set; }
    public long GameDuration { get; set; }
    public int ChampionId { get; set; }
    public int Summoner1Id { get; set; }
    public int Summoner2Id { get; set; }
    public Boolean Win { get; set; }
    public Boolean GameEndedInEarlySurrender { get; set; }
    public int Kills { get; set; }
    public int Deaths { get; set; }
    public int Assists { get; set; }
    public int ChampLevel { get; set; }
    public String ChampionName { get; set; }
    public int TotalMinionsKilled { get; set; }
    public int LeaderboardEntryId { get; set; }
    public virtual LeaderboardEntry LeaderboardEntry { get; set; }
}