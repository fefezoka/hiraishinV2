using System.Net;
using System.Text.Json;
using Hiraishin.Data.Context;
using Hiraishin.Domain.Data;
using Hiraishin.Domain.Dto;
using Hiraishin.Domain.Dto.Hiraishin;
using Hiraishin.Domain.Entities;
using Hiraishin.Domain.Interface.Services;
using Hiraishin.Domain.Utility.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Hiraishin.Services;
public class HiraishinService : IHiraishinService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<HiraishinService> _logger;
    private readonly HiraishinContext _hiraishinContext;

    public HiraishinService(HttpClient httpClient, ILogger<HiraishinService> logger, HiraishinContext hiraishinContext)
    {
        _httpClient = httpClient;
        _logger = logger;
        _hiraishinContext = hiraishinContext;
    }

    public async Task<List<PlayerInfoDTO>> GetLeaderboard()
    {
        var tasks = PlayersData.Puuids.Select(FetchPlayerDataAsync);
        var allPlayers = (await Task.WhenAll(tasks)).ToList();

        var recordLeagueRanking = new[] { "RANKED_SOLO_5x5", "RANKED_FLEX_SR" }.Select((queueType, index) =>
        {
            return allPlayers
                .Where(p => p.Leagues[index] != null)
                .OrderByDescending(p => p.Leagues[index].TotalLP)
                .ThenByDescending(p => p.Leagues[index].Winrate)
                .Select((player, i) => new { Player = player, Index = i + 1 })
                .ToDictionary(
                    x => x.Player.GameName,
                    x => x.Index
                    );
        }).ToList();

        foreach (var player in allPlayers)
        {
            for (int i = 0; i < player.Leagues.Count; i++)
            {
                var league = player.Leagues[i];
                if (league != null && recordLeagueRanking[i].TryGetValue(player.GameName, out var index))
                {
                    league.Index = index;

                    if (league.Index == 1)
                    {
                        var lastUserLeaderboard = await _hiraishinContext.LeaderboardEntry
                            .Where(x => x.Puuid == player.Puuid && x.QueueType == league.QueueType)
                            .OrderByDescending(x => x.WeekStart)
                            .FirstAsync();

                        league.ArrivedOnTop = lastUserLeaderboard.ArrivedOnTop;
                    }
                }
            }
        }

        return allPlayers;
    }

    public async Task<List<Match>> GetMatchHistoryAsync(string puuid, string queue)
    {
        var matchIds = await GetWithRiotErrorHandlingAsync<List<string>>(
            $"https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&queue={queue}&count=5"
        );

        if (matchIds == null || matchIds.Count == 0)
            return new List<Match>();

        var matchDetailTasks = matchIds.Select(async matchId => 
            await GetWithRiotErrorHandlingAsync<Match>($"https://americas.api.riotgames.com/lol/match/v5/matches/{matchId}")
        );

        var matchDetails = await Task.WhenAll(matchDetailTasks);    

        return matchDetails.ToList();
    }

    public async Task<List<LeaderboardEntry>> GetLastWeekLeaderboard()
    {
        DateTime now = DateTime.UtcNow.Date;
        DateTime lastMonday = now.AddDays(1 - (int)now.DayOfWeek).AddHours(3);

        return await _hiraishinContext.LeaderboardEntry.Where(x => x.WeekStart == lastMonday).ToListAsync();
    }

    public async Task<List<LeaderboardEntry>> GetPastLeaderboardByUser(string puuid)
    {
        DateTime threeMonthsAgo = DateTime.UtcNow.Date.AddDays(-90);

        return await _hiraishinContext.LeaderboardEntry.Where(x => x.WeekStart >= threeMonthsAgo && x.Puuid == puuid).ToListAsync();
    }

    private async Task<PlayerInfoDTO> FetchPlayerDataAsync(string puuid)
    {
        var summoner =
            await GetWithRiotErrorHandlingAsync<Summoner>(
                $"https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}");

        await Task.Delay(500);

        var account =
            await GetWithRiotErrorHandlingAsync<Account>(
                $"https://americas.api.riotgames.com/riot/account/v1/accounts/by-puuid/{puuid}");

        await Task.Delay(500);

        var leagues =
            await GetWithRiotErrorHandlingAsync<List<League>>(
                $"https://br1.api.riotgames.com/lol/league/v4/entries/by-puuid/{puuid}");

        var rankedSolo = leagues.FirstOrDefault(x => x.QueueType == "RANKED_SOLO_5x5");
        var rankedFlex = leagues.FirstOrDefault(x => x.QueueType == "RANKED_FLEX_SR");

        var allLeagues = new[] { rankedSolo, rankedFlex }.Select(league =>
        {
            if (league == null) return null;

            return new LeagueDTO(league);
        }).ToList();

        return new PlayerInfoDTO()
        {
            GameName = account.GameName,
            TagLine = account.TagLine,
            Puuid = summoner.Puuid,
            Leagues = allLeagues,
            ProfileIconId = summoner.ProfileIconId,
            SummonerLevel = summoner.SummonerLevel,
        };

    }
    private async Task<T> GetWithRiotErrorHandlingAsync<T>(string url)
    {
        var response = await _httpClient.GetAsync(url);

        if (!response.IsSuccessStatusCode)
        {
            throw response.StatusCode switch
            {
                HttpStatusCode.TooManyRequests => new TooManyRequestsException(response.ReasonPhrase),
                HttpStatusCode.BadRequest => new BadRequestException(response.ReasonPhrase),
                HttpStatusCode.NotFound => new NotFoundException(response.ReasonPhrase),
                _ => new Exception($"Unhandled Riot API error: {(int)response.StatusCode}"),
            };
        }

        return JsonSerializer.Deserialize<T>(await response.Content.ReadAsStringAsync());
    }
}