using System.Text.Json.Serialization;

namespace Hiraishin.Domain.Dto.Hiraishin
{
    public class SummonerDTO
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }
        [JsonPropertyName("accountId")]
        public string AccountId { get; set; }
        [JsonPropertyName("puuid")]
        public string Puuid { get; set; }
    }
}
