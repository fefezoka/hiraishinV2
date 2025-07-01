using Hiraishin.Domain.Dto.Hiraishin;
using Hiraishin.Domain.Entities;

namespace Hiraishin.Domain.Interface.Services
{
    public interface IHiraishinService
    {
        Task<List<PlayerInfoDTO>> GetLeaderboard();
        Task<List<MatchApiModel>> GetMatchHistoryAsync(string puuid, int queue, long startTime = 0, int count = 5);
        Task<List<LeaderboardEntry>> GetLastWeekLeaderboard();
        Task<List<LeaderboardEntry>> GetPastLeaderboardByUser(string puuid);
    }
}
