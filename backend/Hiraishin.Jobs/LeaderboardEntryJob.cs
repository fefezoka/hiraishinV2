using Hiraishin.Data.Context;
using Hiraishin.Domain.Entities;
using Hiraishin.Domain.Interface.Services;
using Microsoft.Extensions.Logging;
using Hangfire.Server;
using Microsoft.EntityFrameworkCore;
using Npgsql;

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

        public async Task Run(PerformContext context, CancellationToken token, bool weekly)
        {
            var jobId = context.BackgroundJob.Id;

            using var _ = _logger.BeginScope("LeaderboardJob");

            _logger.LogInformation("[{JobId}] Starting weekly ranking job...", jobId);

            var players = _hiraishinService.GetLeaderboard().Result;

            var snapshots = new List<LeaderboardEntry>();

            DateTime now = DateTime.UtcNow.Date.AddHours(3);

            foreach (var player in players)
            {
                var lastUserLeaderboard = await _hiraishinContext.LeaderboardEntry
                    .Where(x => x.Puuid == player.Puuid)
                    .GroupBy(x => x.QueueType)
                    .Select(g => g.OrderByDescending(x => x.WeekStart).First())
                    .ToListAsync();

                foreach (var league in player.Leagues)
                {
                    var leagueLastUserLeaderboard = lastUserLeaderboard.Find(x => x.QueueType == league.QueueType);

                    if (!weekly && leagueLastUserLeaderboard?.TotalLP == league.TotalLP)
                    {
                        _logger.LogError("O total de PDL não mudou de um dia pro outro. weekly: [{weekly}]", weekly);
                        continue;
                    }

                    DateTime? ArrivedOnTop = null;

                    if (league.Index == 1)
                    {
                        if (leagueLastUserLeaderboard == null || leagueLastUserLeaderboard.ArrivedOnTop == null)
                        {
                            ArrivedOnTop = DateTime.UtcNow.Date.AddHours(3);
                        }
                        else
                        {
                            ArrivedOnTop = leagueLastUserLeaderboard.ArrivedOnTop;
                        }
                    }

                    snapshots.Add(new LeaderboardEntry
                    {
                        Puuid = player.Puuid,
                        Index = league.Index,
                        LeaguePoints = league.LeaguePoints,
                        QueueType = league.QueueType,
                        Rank = league.Rank,
                        Tier = league.Tier,
                        TotalLP = league.TotalLP,
                        WeekStart = now,
                        ArrivedOnTop = ArrivedOnTop
                    });
                }
            }

            try
            {
                _hiraishinContext.LeaderboardEntry.AddRange(snapshots);
                await _hiraishinContext.SaveChangesAsync();
            }
            catch (PostgresException ex)
            {
                _logger.LogWarning(ex, "[{JobId}] Leaderboard job error occured!", jobId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[{JobId}] Leaderboard job error occured!", jobId);
            }

            _logger.LogInformation("[{JobId}] Finished lederboard entry job", jobId);
        }
    }
}
