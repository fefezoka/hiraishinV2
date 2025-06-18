namespace Hiraishin.Domain.Entities;

public class RankSemanalModel
{
    public Guid Id { get; set; }
    public String Name { get; set; }
    public String Tier { get; set; }
    public int Pdl { get; set; }
}

public static class LolUtils
{
    private static readonly Dictionary<string, int> BaseLeaguePoints =
        new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
        {
            {"SILVER", 0},
            {"GOLDEN", 1},
            {"PLATINUM", 2},
            {"EMERALD", 3},
            {"DIAMOND", 4},
            {"MASTER", 5},
        };

    private static readonly List<string> Ranks = new List<string> { "IV", "III", "II", "I" };
}