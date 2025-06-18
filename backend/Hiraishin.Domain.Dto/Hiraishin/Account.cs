using System.Text.Json.Serialization;

namespace Hiraishin.Domain.Dto;

public class Account
{
    [JsonPropertyName("puuid")]
    public string Puuid { get; set; }
    [JsonPropertyName("gameName")]
    public string GameName { get; set; }
    [JsonPropertyName("tagLine")]
    public string TagLine { get; set; }
}