using System.Text.Json.Serialization;

namespace Hiraishin.Domain.Dto.Hiraishin;

public class Match
{
    [JsonPropertyName("info")]
    public Info info { get; set; }

    public class Info
    {
        [JsonPropertyName("gameDuration")]
        public long GameDuration { get; set; }
        [JsonPropertyName("participants")]
        public List<Participant> Participants { get; set; }
        public class Participant
        {
            [JsonPropertyName("puuid")]
            public String Puuid { get; set; }
            [JsonPropertyName("summonerName")]
            public String SummonerName { get; set; }
            [JsonPropertyName("riotIdGameName")]
            public String RiotIdGameName { get; set; }
            [JsonPropertyName("riotIdTagline")]
            public String RiotIdTagline { get; set; }
            [JsonPropertyName("championId")]
            public int ChampionId { get; set; }
            [JsonPropertyName("champLevel")]
            public int ChampLevel { get; set; }
            [JsonPropertyName("summoner1Id")]
            public int Summoner1Id { get; set; }
            [JsonPropertyName("summoner2Id")]
            public int Summoner2Id { get; set; }
            [JsonPropertyName("item0")]
            public int Item0 { get; set; }
            [JsonPropertyName("item1")]
            public int Item1 { get; set; }
            [JsonPropertyName("item2")]
            public int Item2 { get; set; }
            [JsonPropertyName("item3")]
            public int Item3 { get; set; }
            [JsonPropertyName("item4")]
            public int Item4 { get; set; }
            [JsonPropertyName("item5")]
            public int Item5 { get; set; }
            [JsonPropertyName("item6")]
            public int Item6 { get; set; }
            [JsonPropertyName("win")]
            public Boolean Win { get; set; }
            [JsonPropertyName("gameEndedInEarlySurrender")]
            public Boolean GameEndedInEarlySurrender { get; set; }
            [JsonPropertyName("kills")]
            public int Kills { get; set; }
            [JsonPropertyName("deaths")]
            public int Deaths { get; set; }
            [JsonPropertyName("visionScore")]
            public int VisionScore { get; set; }
            [JsonPropertyName("assists")]
            public int Assists { get; set; }
            [JsonPropertyName("totalMinionsKilled")]
            public int TotalMinionsKilled { get; set; }
            [JsonPropertyName("championName")]
            public String ChampionName { get; set; }
        }
    }
}