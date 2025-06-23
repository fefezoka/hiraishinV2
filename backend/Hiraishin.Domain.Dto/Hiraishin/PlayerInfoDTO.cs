namespace Hiraishin.Domain.Dto.Hiraishin;

public class PlayerInfoDTO
{
    public string AccountId { get; set; }
    public string GameName { get; set; }
    public string TagLine { get; set; }
    public string Id { get; set; }
    public string Puuid { get; set; }
    public int ProfileIconId { get; set; }
    public int SummonerLevel { get; set; }
    public List<LeagueDTO> Leagues { get; set; }
}