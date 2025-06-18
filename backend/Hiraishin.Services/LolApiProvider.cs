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

    public async Task<Summoner> GetUser(string accountId)
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
            var playerInfo = JsonSerializer.Deserialize<Summoner>(content);

            return playerInfo;
        }
        catch (Exception e)
        {
            _logger.LogError(e, $"Erro ao obter usuário {accountId}");
            return null;
        }

    }

    public async Task<List<Summoner>> GetAllPlayers()
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

    public async Task<List<PlayerInfoDTO>> GetAllPlayersDetailed()
    {
        async Task<PlayerInfoDTO> FetchPlayerDataAsync(PlayerInfoDTO info)
        {
            try
            {
                var playerResponse =
                    await _httpClient.GetAsync(
                        $"https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-account/{info.AccountId}");
                if (!playerResponse.IsSuccessStatusCode) return null;

                await Task.Delay(500);

                var summoner = JsonSerializer.Deserialize<Summoner>(await playerResponse.Content.ReadAsStringAsync());

                var accountResponse =
                    await _httpClient.GetAsync(
                        $"https://americas.api.riotgames.com/riot/account/v1/accounts/by-puuid/{summoner.Puuid}");
                if (!accountResponse.IsSuccessStatusCode) return null;

                await Task.Delay(500);

                var account = JsonSerializer.Deserialize<Account>(await accountResponse.Content.ReadAsStringAsync());

                var leaguesResponse =
                    await _httpClient.GetAsync(
                        $"https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/{summoner.Id}");
                if (!leaguesResponse.IsSuccessStatusCode) return null;

                var leagues =
                    JsonSerializer.Deserialize<List<League>>(await leaguesResponse.Content.ReadAsStringAsync());

                var rankedSolo = leagues.FirstOrDefault(x => x.QueueType == "RANKED_SOLO_5x5");
                var rankedFlex = leagues.FirstOrDefault(x => x.QueueType == "RANKED_FLEX_SR");

                var allLeagues = new[] { rankedSolo, rankedFlex }.Select(league =>
                {
                    if (league == null) return null;

                    return new LeagueDTO(league);
                }).ToList();

                return new PlayerInfoDTO()
                {
                    AccountId = info.AccountId,
                    GameName = account.GameName,
                    TagLine = account.TagLine,
                    Id = summoner.Id,
                    Puuid = summoner.Puuid,
                    Leagues = allLeagues,
                    ProfileIconId = summoner.ProfileIconId,
                    SummonerLevel = summoner.SummonerLevel,
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

        var recordLeagueRanking = new[] { "RANKED_SOLO_5x5", "RANKED_FLEX_SR" }.Select((queueType, index) =>
        {
            return allPlayers
                .Where(p => p.Leagues[index] != null)
                .OrderByDescending(p => p.Leagues[index].TotalLP)
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
        }).ToList();

        foreach (var player in allPlayers)
        {
            for (int i = 0; i < player.Leagues.Count; i++)
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

    public async Task<List<Match>> GetMatchHistoryAsync(string puuid, string queue)
    {
        try
        {
// 1. Buscar os últimos 5 Match IDs
            var idsUrl =
                $"https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&queue={queue}&count=5";
            var idsResponse = await _httpClient.GetAsync(idsUrl);
            
            if (!idsResponse.IsSuccessStatusCode)
            {
                _logger.LogError(
                    $"Erro ao buscar match IDs para PUUID {puuid}, Queue {queue}: {idsResponse.StatusCode}");
                return new List<Match>();
            }

            var idsContent = await idsResponse.Content.ReadAsStringAsync();
            var matchIds = JsonSerializer.Deserialize<List<string>>(idsContent);

            if (matchIds == null || matchIds.Count == 0)
                return new List<Match>();

            // 2. Buscar detalhes de cada partida
            var matchDetailTasks = matchIds.Select(async matchId =>
            {
                try
                {
                    var matchUrl = $"https://americas.api.riotgames.com/lol/match/v5/matches/{matchId}";
                    var matchResponse = await _httpClient.GetAsync(matchUrl);

                    if (!matchResponse.IsSuccessStatusCode)
                    {
                        _logger.LogWarning($"Erro ao buscar detalhes da partida {matchId}: {matchResponse.StatusCode}");
                        return null;
                    }

                    var matchContent = await matchResponse.Content.ReadAsStringAsync(); 
                    var match = JsonSerializer.Deserialize<Match>(matchContent);;

                    return match;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Erro ao processar detalhes da partida {matchId}");
                    return null;
                }
            });

            var matchDetails = await Task.WhenAll(matchDetailTasks);

            return matchDetails.Where(m => m != null).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Erro geral ao buscar histórico de partidas para o PUUID {puuid}");
            return new List<Match>();
        }
    }
}