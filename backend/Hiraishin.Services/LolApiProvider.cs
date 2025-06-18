using System.Text.Json;
using Hiraishin.Domain.Dto;
using Hiraishin.Domain.Dto.Hiraishin;
using Hiraishin.Domain.Interface.Services;
using Hiraishin.Domain.Utility;
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
    
    public async Task<SummonerDTO> GetUser(string accountId)
    {
        try
        {
            var requestUrl = $"https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-account/{accountId}";
            var response = await _httpClient.GetAsync(requestUrl);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"Falha ao obter usuário {accountId}. Status: {response.StatusCode}");
                return null;
            }
            var content = await response.Content.ReadAsStringAsync();
            var playerInfo = JsonSerializer.Deserialize<SummonerDTO>(content);

            return playerInfo;
        }
        catch (Exception e)
        {
            _logger.LogError(e, $"Erro ao obter usuário {accountId}");
            return null;
        }
        
    }

    public async Task<List<SummonerDTO>> GetAllPlayers()
    {
        var tasks = PlayerAccountIds.Ids
        .Select(async accountId =>
        {
            await Task.Delay(100);
            return await GetUser(accountId);
        });

        var results = await Task.WhenAll(tasks); // faz todas requisições ao mesmo tempo

        return results
            .Where(player => player != null)
            .ToList();
    }

    public async Task<List<PlayerInfoDTO>> GetAllSummonersDetailsAsync()
    {
        async Task<PlayerInfoDTO> FetchPlayerDataAsync(PlayerInfoDTO info)
    {
        try
        {
            var playerResponse = await _httpClient.GetAsync($"https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-account/{info.AccountId}");
            if (!playerResponse.IsSuccessStatusCode) return null;

            await Task.Delay(500); // delay proposital

            var player = JsonSerializer.Deserialize<SummonerDTO>(await playerResponse.Content.ReadAsStringAsync());

            var accountResponse = await _httpClient.GetAsync($"https://americas.api.riotgames.com/riot/account/v1/accounts/by-puuid/{player.Puuid}");
            if (!accountResponse.IsSuccessStatusCode) return null;

            await Task.Delay(500);

            var account = JsonSerializer.Deserialize<AccountDTO>(await accountResponse.Content.ReadAsStringAsync());

            var leaguesResponse = await _httpClient.GetAsync($"https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/{player.Id}");
            if (!leaguesResponse.IsSuccessStatusCode) return null;

            var leagues = JsonSerializer.Deserialize<List<LeagueDTO>>(await leaguesResponse.Content.ReadAsStringAsync());

            var rankedSolo = leagues.FirstOrDefault(x => x.QueueType == "RANKED_SOLO_5x5");
            var rankedFlex = leagues.FirstOrDefault(x => x.QueueType == "RANKED_FLEX_SR");

            //var allLeagues = new[] { rankedSolo, rankedFlex }.Select(league =>
            //{
                //if (league == null) return null;

                //league.Winrate = (int)Math.Round((double)league.Wins / (league.Wins + league.Losses) * 100);
                //league.TotalLP = LeagueUtils.GetTotalLP(league); // seu método auxiliar

                //return league;
           // }).ToList();

            return new PlayerInfoDTO()
            {
                // Combine info + player + account + leagues
                AccountId = info.AccountId,
                GameName = account.GameName,
                TagLine = account.TagLine,
                Id = player.Id,
                Puuid = player.Puuid,
                Leagues = new[] { rankedSolo, rankedFlex }
                // ... outros campos que quiser mesclar
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Erro ao buscar info do jogador: {info.AccountId}");
            return null;
        }
    }

    var tasks = PlayerAccountIds.Ids.Select(id => FetchPlayerDataAsync(new PlayerInfoDTO() { AccountId = id }));
    var allPlayers = (await Task.WhenAll(tasks)).Where(p => p != null).ToList();

    // Agora monta os rankings
    var recordLeagueRanking = new[] { "RANKED_SOLO_5x5", "RANKED_FLEX_SR" }.Select((queueType, index) =>
    {
        var leagueRanking = allPlayers
            .Where(p => p.Leagues[index] != null)
            .OrderByDescending(p => p.Leagues[index].TotalLp)
            .ThenByDescending(p => p.Leagues[index].Winrate)
            .Select((player, i) => new { Player = player, Index = i + 1 })
            .ToDictionary(
                x => x.Player.GameName,
                x => new
                {
                    x.Index,
                    Elo = new
                    {
                        x.Player.Leagues[index].Tier,
                        x.Player.Leagues[index].Rank,
                        x.Player.Leagues[index].LeaguePoints
                    }
                });

        // opcional: persistir leagueRanking em algum lugar

        return leagueRanking;
    }).ToList();

    // Anexa o índice do ranking de volta ao DTO
    foreach (var player in allPlayers)
    {
        for (int i = 0; i < player.Leagues.Length; i++)
        {
            var league = player.Leagues[i];
            if (league != null && recordLeagueRanking[i].TryGetValue(player.GameName, out var rankingInfo))
            {
                league.Index = rankingInfo.Index;
            }
        }
    }

    return allPlayers;
    }
}