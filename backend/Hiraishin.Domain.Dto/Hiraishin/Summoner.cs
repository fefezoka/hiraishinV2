using System.Text.Json.Serialization;

namespace Hiraishin.Domain.Dto.Hiraishin
{
    public class Summoner
    {
        [JsonPropertyName("puuid")]
        public string Puuid { get; set; }
        [JsonPropertyName("profileIconId")]
        public int ProfileIconId { get; set; }
        [JsonPropertyName("summonerLevel")]
        public int SummonerLevel { get; set; }
    }
}
