using Hiraishin.Domain.Utility;

namespace Hiraishin.Domain.Dto.Hiraishin;

public class LeagueDTO
{
    public String LeagueId { get; set; }
    public String Puuid { get; set; }
    public String QueueType { get; set; }
    public String Tier { get; set; }
    public String Rank { get; set; }
    public int LeaguePoints { get; set; }
    public int Wins { get; set; }
    public int Losses { get; set; }
    public int TotalLP { get; set; }
    public int Index { get; set; }
    public int Winrate => Wins + Losses == 0 ? 0 : (int)Math.Round((double)Wins / (Wins + Losses) * 100);
    public DateTime? ArrivedOnTop { get; set; }

    public LeagueDTO(LeagueApiModel league)
    {
        LeagueId = league.LeagueId;
        Puuid = league.Puuid;
        QueueType = league.QueueType;
        Tier = league.Tier;
        Rank = league.Rank;
        LeaguePoints = league.LeaguePoints;
        Wins = league.Wins;
        Losses = league.Losses;
        TotalLP = LeagueUtils.GetTotalLP(league.Tier, league.Rank, league.LeaguePoints);
    }
}