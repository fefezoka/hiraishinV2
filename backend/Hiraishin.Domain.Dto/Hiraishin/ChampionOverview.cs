using System.Globalization;

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
        public string AverageKills { get; set; }
        public string AverageDeaths { get; set; }
        public string AverageAssists { get; set; }
        public string AverageKDA => string.Format(CultureInfo.InvariantCulture, "{0:N2}:1", (double.Parse(AverageKills) + double.Parse(AverageAssists)) / double.Parse(AverageDeaths));
    }
}
