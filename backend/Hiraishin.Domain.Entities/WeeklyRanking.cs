namespace Hiraishin.Domain.Entities;

public enum QueueType
{
    Solo,
    Flex
}

public class WeeklyRanking
{
    public int Id { get; set; }
    public string AccountId { get; set; }
    public DateTime WeekStart { get; set; }
    public QueueType QueueType { get; set; }
    public string Tier { get; set; }
    public string Rank { get; set; }
    public int LeaguePoints { get; set; }
    public int TotalLP { get; set; }
    public int Index { get; set; }
}