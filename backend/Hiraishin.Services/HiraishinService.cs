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

namespace Hiraishin.Services;
public class HiraishinService : IHiraishinService
{
    private readonly HttpClient _httpClient;
    private readonly HiraishinContext _hiraishinContext;

    public HiraishinService(HttpClient httpClient, HiraishinContext hiraishinContext)
    {
        _httpClient = httpClient;
        _hiraishinContext = hiraishinContext;
    }

    public async Task<List<PlayerInfoDTO>> GetLeaderboard()
    {
        var tasks = PlayersData.Puuids.Select(FetchPlayerDataAsync);
        var allPlayers = (await Task.WhenAll(tasks)).ToList();

        for(int q = 0; q < 2; q++) // 2 queue types
        {
            var orderedPlayers = allPlayers
            .Where(p => p.Leagues[q] != null)
            .OrderByDescending(p => p.Leagues[q].TotalLP)
            .ThenByDescending(p => p.Leagues[q].Winrate)
            .ToList();

            for (int i = 0; i < orderedPlayers.Count; i++)
            {
                var player = orderedPlayers[i];
                var league = player.Leagues[q];
                league.Index = i + 1;

                if (league.Index == 1)
                {
                    var lastUserLeaderboard = await _hiraishinContext.LeaderboardEntry
                        .Where(x => x.Puuid == player.Puuid && x.QueueType == league.QueueType)
                        .OrderByDescending(x => x.Day)
                        .FirstOrDefaultAsync();

                    league.ArrivedOnTop = lastUserLeaderboard?.ArrivedOnTop;
                }
            }
        }

        return allPlayers;
    }

    public async Task<List<MatchApiModel>> GetMatchHistoryAsync(string puuid, int queue, long startTime, int count)
    {
        var matchIds = await GetWithRiotErrorHandlingAsync<List<string>>(
            $"https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?" +
            $"startTime={startTime}" +
            $"&queue={queue}" +
            $"&count={count}"
        );

        if (matchIds == null || matchIds.Count == 0)
            return new List<MatchApiModel>();

        var matchDetailTasks = matchIds.Select(async matchId => 
            await GetWithRiotErrorHandlingAsync<MatchApiModel>($"https://americas.api.riotgames.com/lol/match/v5/matches/{matchId}")
        );

        var matchDetails = await Task.WhenAll(matchDetailTasks);    

        return matchDetails.ToList();
    }

    public async Task<List<LeaderboardEntry>> GetLastWeekLeaderboard()
    {
        DateTime now = DateTime.UtcNow.Date;
        DateTime lastSunday = now.AddDays(0 - (int)now.DayOfWeek).AddHours(3);

        return await _hiraishinContext.LeaderboardEntry
            .Include(x => x.Matches)
            .Where(x => x.Day == lastSunday)
            .ToListAsync();
    }

    public async Task<List<LeaderboardEntry>> GetPastLeaderboardByUser(string puuid)
    {
        DateTime threeMonthsAgo = DateTime.UtcNow.Date.AddDays(-90);

        return await _hiraishinContext.LeaderboardEntry
            .Include(x => x.Matches)
            .Where(x => x.Day >= threeMonthsAgo && x.Puuid == puuid)
            .ToListAsync();
    }

    private async Task<PlayerInfoDTO> FetchPlayerDataAsync(string puuid)
    {
        var summoner =
            await GetWithRiotErrorHandlingAsync<SummonerApiModel>(
                $"https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}");

        await Task.Delay(500);

        var account =
            await GetWithRiotErrorHandlingAsync<AccountApiModel>(
                $"https://americas.api.riotgames.com/riot/account/v1/accounts/by-puuid/{puuid}");

        await Task.Delay(500);

        var leagues =
            await GetWithRiotErrorHandlingAsync<List<LeagueApiModel>>(
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