using System.Text.Json;
using Hiraishin.Domain.Interface.Services;
using Microsoft.Extensions.Logging;

namespace Hiraishin.Services;


public class LolApiProvider : ILolApiProvider
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<LolApiProvider> _logger;
    
    public LolApiProvider(HttpClient httpClient, ILogger<LolApiProvider> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }
    
    public async Task<PlayerInfo?> GetUser(string accountId)
    {
        try
        {
            var requestUrl = $"https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-account/${accountId}";
        
            var response = await _httpClient.GetAsync(requestUrl);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"Falha ao obter usuário {accountId}. Status: {response.StatusCode}");
                return null;
            }
            var content = await response.Content.ReadAsStringAsync();
            var playerInfo = JsonSerializer.Deserialize<PlayerInfo>(content);

            return playerInfo;
        }
        catch (Exception e)
        {
            _logger.LogError(e, $"Erro ao obter usuário {accountId}");
            return null;
        }
        
    }

    public async Task<List<PlayerInfo>> GetAllPlayers()
    {
        var players = new List<PlayerInfo>();
        
        foreach (var accountId in PlayerAccountIds.Ids)
        {
            var player = await GetUser(accountId);
            if (player != null)
            {
                players.Add(player);
            }
            
            await Task.Delay(100);
        }
        
        return players;
    }
}