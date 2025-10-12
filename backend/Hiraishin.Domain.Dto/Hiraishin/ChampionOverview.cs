namespace Hiraishin.Domain.Dto.Hiraishin
{
    public class ChampionOverview
    {
        public List<ChampionOverviewPlayer> Players { get; set; }
        public List<Match> Matches { get; set; }
    }

    public class ChampionOverviewPlayer
    {
        public string Puuid { get; set; }
        public int Wins { get; set; }
        public int Losses { get; set; }
    }
}
