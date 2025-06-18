using System.Text.Json.Serialization;

namespace Hiraishin.Domain.Dto.Hiraishin;

public class PlayerInfoDTO
{
    [JsonPropertyName("accountId")]
    public string AccountId { get; set; }
    [JsonPropertyName("gameName")]
    public string GameName { get; set; }
    [JsonPropertyName("tagLine")]
    public string TagLine { get; set; }
    [JsonPropertyName("id")]
    public string Id { get; set; }
    [JsonPropertyName("puuid")]
    public string Puuid { get; set; }
    public LeagueDTO[] Leagues { get; set; }
}