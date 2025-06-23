using Hiraishin.Data.Context;
using Hiraishin.Domain.Entities;
using Hiraishin.Domain.Interface.Services;
using Microsoft.Extensions.Logging;
using Hangfire.Server;

namespace Hiraishin.Jobs
{
    public class WeeklyRankingJob
    {
        private readonly IHiraishinService _hiraishinService;
        private readonly ILogger<WeeklyRankingJob> _logger;
        private readonly HiraishinContext _hiraishinContext;

        public WeeklyRankingJob(IHiraishinService hiraishinService, HiraishinContext hiraishinContext, ILogger<WeeklyRankingJob> logger)
        {
            _hiraishinService = hiraishinService;
            _logger = logger;
            _hiraishinContext = hiraishinContext;
        }

        public async Task Run(PerformContext context, CancellationToken token)
        {
            var jobId = context.BackgroundJob.Id;

            using var _ = _logger.BeginScope("WeeklyRankingJob");

            _logger.LogInformation("[{JobId}] Starting weekly ranking job...", jobId);

            var players = _hiraishinService.GetLeaderboard().Result;

            var snapshots = new List<WeeklyRanking>();

            DateTime now = DateTime.UtcNow;
            DateTime formattedNow = new DateTime(now.Year, now.Month, now.Day, now.Hour, 0, 0, 0, now.Kind);

            foreach (var player in players)
            {
                foreach(var league in player.Leagues)
                {
                    snapshots.Add(new WeeklyRanking
                    {
                        AccountId = player.AccountId,
                        Index = league.Index,
                        LeaguePoints = league.LeaguePoints,
                        QueueType = league.QueueType,
                        Rank = league.Rank,
                        Tier = league.Tier,
                        TotalLP = league.TotalLP,
                        WeekStart = formattedNow
                    });
                }
            }

            _hiraishinContext.WeeklyRanking.AddRange(snapshots);
            await _hiraishinContext.SaveChangesAsync();

            _logger.LogInformation("[{JobId}] Finished weekly ranking job", jobId);
        }
    }
}
