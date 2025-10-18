using Hiraishin.Data.Context;
using Hiraishin.Domain.Entities;
using Hiraishin.Domain.Interface.Services;
using Microsoft.Extensions.Logging;
using Hangfire.Server;
using Microsoft.EntityFrameworkCore;
using Hiraishin.Domain.Dto.Hiraishin;

namespace Hiraishin.Jobs
{
    public class LeaderboardEntryJob
    {
        private readonly IHiraishinService _hiraishinService;
        private readonly ILogger<LeaderboardEntryJob> _logger;
        private readonly HiraishinContext _hiraishinContext;

        public LeaderboardEntryJob(IHiraishinService hiraishinService, HiraishinContext hiraishinContext, ILogger<LeaderboardEntryJob> logger)
        {
            _hiraishinService = hiraishinService;
            _logger = logger;
            _hiraishinContext = hiraishinContext;
        }

        public async Task Run(PerformContext context, CancellationToken token)
        {
            var jobId = context.BackgroundJob.Id;
            using var _ = _logger.BeginScope("LeaderboardJob");
            _logger.LogInformation("[{JobId}] Starting weekly ranking job...", jobId);

            var players = await _hiraishinService.GetLeaderboard();

            var leaderboardEntries = new List<LeaderboardEntry>();

            var weekly = DateTime.UtcNow.DayOfWeek == DayOfWeek.Monday;
            var utcTodayAtSix = DateTime.UtcNow.Date.AddHours(9); // 6 horas + 3 do utc
            var utcTodayAtSixTimestamp = (long)utcTodayAtSix.Subtract(DateTime.UnixEpoch).TotalSeconds;
            var utcYesterdayAtSix = utcTodayAtSix.AddDays(-1);
            var utcYesterdayAtSixTimestamp = (long)utcYesterdayAtSix.Subtract(DateTime.UnixEpoch).TotalSeconds;

            var rankedSoloPlayersCount = players.Where(x => x.Leagues.Any(y => y.QueueType == "RANKED_SOLO_5x5")).Count();
            var rankedFlexPlayersCount = players.Where(x => x.Leagues.Any(y => y.QueueType == "RANKED_FLEX_SR")).Count();

            foreach (var player in players)
            {
                _logger.LogInformation("Processing player [{player}]", player.GameName);

                var lastUserLeaderboard = await _hiraishinContext.LeaderboardEntry
                    .Where(x => x.Puuid == player.Puuid)
                    .GroupBy(x => x.QueueType)
                    .Select(g => g.OrderByDescending(x => x.Day).First())
                    .ToListAsync();

                foreach (var league in player.Leagues)
                {
                    var leagueLastUserLeaderboard = lastUserLeaderboard.Find(x => x.QueueType == league.QueueType);
                    var playedYesterday = (league.Wins + league.Losses) != (leagueLastUserLeaderboard?.Wins + leagueLastUserLeaderboard?.Losses);

                    if (!weekly && !playedYesterday)
                        continue;

                    DateTime? ArrivedOnTop = null;
                    DateTime? ArrivedOnBottom = null;

                    if (league.Index == 1)
                    {
                        if (leagueLastUserLeaderboard == null || leagueLastUserLeaderboard.ArrivedOnTop == null)
                        {
                            ArrivedOnTop = utcYesterdayAtSix;
                        }
                        else
                        {
                            ArrivedOnTop = leagueLastUserLeaderboard.ArrivedOnTop;
                        }
                    }

                    if (league.Index == (league.QueueType == "RANKED_SOLO_5x5" ? rankedSoloPlayersCount : rankedFlexPlayersCount))
                    {
                        if (leagueLastUserLeaderboard == null || leagueLastUserLeaderboard.ArrivedOnBottom == null)
                        {
                            ArrivedOnBottom = utcYesterdayAtSix;
                        }
                        else
                        {
                            ArrivedOnBottom = leagueLastUserLeaderboard.ArrivedOnBottom;
                        }
                    }

                    var queueTypeNumber = league.QueueType == "RANKED_SOLO_5x5" ? 420 : 440;
                    var matchesResponse = await _hiraishinService.GetMatchHistoryAsync(player.Puuid, 
                        queueTypeNumber, 
                        utcYesterdayAtSixTimestamp, 
                        utcTodayAtSixTimestamp, 
                        100);
                    var matches = new List<Match>();

                    foreach (var matchResponse in matchesResponse)
                    {
                        var user = matchResponse.info.Participants.Find(x => x.Puuid == player.Puuid)!;

                        if (user.GameEndedInEarlySurrender)
                            continue;

                        var match = new Match
                        {
                            Assists = user.Assists,
                            ChampionId = user.ChampionId,
                            ChampionName = user.ChampionName,
                            Kills = user.Kills,
                            Deaths = user.Deaths,
                            GameDuration = matchResponse.info.GameDuration,
                            Win = user.Win,
                            Summoner1Id = user.Summoner1Id,
                            Summoner2Id = user.Summoner2Id,
                            ChampLevel = user.ChampLevel,
                            TotalMinionsKilled = user.TotalMinionsKilled,
                        };

                        _logger.LogInformation("The user [{player}] played [{mode}] with champion [{champion}] yesterday", player.GameName, league.QueueType, match.ChampionName);

                        matches.Add(match);
                    }

                    var leaderboardEntry = new LeaderboardEntry
                    {
                        Puuid = player.Puuid,
                        Index = league.Index,
                        LeaguePoints = league.LeaguePoints,
                        QueueType = league.QueueType,
                        Rank = league.Rank,
                        Tier = league.Tier,
                        TotalLP = league.TotalLP,
                        Day = utcYesterdayAtSix,
                        ArrivedOnTop = ArrivedOnTop,
                        ArrivedOnBottom = ArrivedOnBottom,
                        Losses = league.Losses,
                        Wins = league.Wins,
                        Matches = matches,
                    };

                    leaderboardEntries.Add(leaderboardEntry);
                }
                Thread.Sleep(10 * 1000);
            }

            _hiraishinContext.LeaderboardEntry.AddRange(leaderboardEntries);
            await _hiraishinContext.SaveChangesAsync();
            _logger.LogInformation("[{JobId}] Finished lederboard entry job", jobId);
        }
    }
}
