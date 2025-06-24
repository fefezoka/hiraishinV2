using System.Text.Json.Serialization;

namespace Hiraishin.Domain.Dto.Hiraishin;

public class League
{
    [JsonPropertyName("leagueId")]
    public String LeagueId { get; set; }
    [JsonPropertyName("puuid")]
    public String Puuid { get; set; }
    [JsonPropertyName("queueType")]
    public String QueueType { get; set; }
    [JsonPropertyName("tier")]
    public String Tier { get; set; }
    [JsonPropertyName("rank")]
    public String Rank { get; set; }
    [JsonPropertyName("leaguePoints")]
    public int LeaguePoints { get; set; }
    [JsonPropertyName("wins")]
    public int Wins { get; set; }
    [JsonPropertyName("losses")]
    public int Losses { get; set; }
}