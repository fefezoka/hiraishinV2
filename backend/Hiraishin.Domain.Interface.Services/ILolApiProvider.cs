using Hiraishin.Domain.Dto.Hiraishin;

namespace Hiraishin.Domain.Interface.Services
{
    public interface ILolApiProvider
    {
        Task<Summoner> GetUser(string accountId);
        Task<List<Summoner>> GetAllPlayers();
        Task<List<PlayerInfoDTO>> GetAllPlayersDetailed();
    }
}
