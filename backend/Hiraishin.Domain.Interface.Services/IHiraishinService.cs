using Hiraishin.Domain.Dto.Hiraishin;
using Hiraishin.Domain.Entities;

namespace Hiraishin.Domain.Interface.Services
{
    public interface IHiraishinService
    {
        Task<List<PlayerInfoDTO>> GetLeaderboard();
        Task<List<Match>> GetMatchHistoryAsync(string puuid, string queue);
        Task<List<LeaderboardEntry>> GetLastWeekLeaderboard();
        Task<List<LeaderboardEntry>> GetPastLeaderboardByUser(string puuid);
    }
}
