using System.Text.Json.Serialization;

namespace Hiraishin.Domain.Dto.Hiraishin;

public class LeagueDTO
{
    [JsonPropertyName("leagueId")]
    public String LeagueId { get; set; }
    [JsonPropertyName("summonerId")]
    public String SummonerId { get; set; }
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
    public int TotalLp { get; set; }
    public int Index { get; set; }
    public int Winrate => Wins + Losses == 0 ? 0 : (int)Math.Round((double)Wins / (Wins + Losses) * 100);
    
}