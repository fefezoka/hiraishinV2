using Hiraishin.Domain.Dto.Hiraishin;

namespace Hiraishin.Domain.Interface.Services
{
    public interface ILolApiProvider
    {
        Task<SummonerDTO> GetUser(string accountId);
        Task<List<SummonerDTO>> GetAllPlayers();
    }
}
