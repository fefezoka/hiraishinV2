using Hiraishin.Services;

namespace Hiraishin.Domain.Interface.Services
{
    public interface ILolApiProvider
    {
        Task<PlayerInfo?> GetUser(string accountId);
        Task<List<PlayerInfo>> GetAllPlayers();
    }
}
