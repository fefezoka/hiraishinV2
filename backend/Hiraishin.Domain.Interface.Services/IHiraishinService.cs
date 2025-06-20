using Hiraishin.Domain.Dto.Hiraishin;

namespace Hiraishin.Domain.Interface.Services
{
    public interface IHiraishinService
    {
        Task<List<PlayerInfoDTO>> GetLeaderboard();
        Task<List<Match>> GetMatchHistoryAsync(string puuid, string queue);
    }
}
