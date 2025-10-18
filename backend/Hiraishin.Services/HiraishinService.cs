using Hiraishin.Data.Context;
using Hiraishin.Domain.Data;
using Hiraishin.Domain.Dto;
using Hiraishin.Domain.Dto.Hiraishin;
using Hiraishin.Domain.Entities;
using Hiraishin.Domain.Interface.Services;
using Hiraishin.Domain.Utility.Exceptions;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Net;
using System.Text.Json;

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

        var queueTypes = new[] { "RANKED_SOLO_5x5", "RANKED_FLEX_SR" };

        foreach (var queueType in queueTypes)
        {
            var orderedPlayers = allPlayers
                .Select(p => new
                {
                    Player = p,
                    League = p.Leagues.FirstOrDefault(l => l.QueueType == queueType)
                })
                .Where(x => x.League != null)
                .OrderByDescending(x => x.League!.TotalLP)
                .ThenByDescending(x => x.League!.Winrate)
                .ToList();

            for (int i = 0; i < orderedPlayers.Count; i++)
            {
                var player = orderedPlayers[i].Player;
                var league = orderedPlayers[i].League;
                league!.Index = i + 1;

                if (league.Index == 1)
                {
                    var lastUserLeaderboard = await _hiraishinContext.LeaderboardEntry
                        .Where(x => x.Puuid == player.Puuid && x.QueueType == league.QueueType)
                        .OrderByDescending(x => x.Day)
                        .FirstOrDefaultAsync();

                    league.ArrivedOnTop = lastUserLeaderboard?.ArrivedOnTop;
                }

                if (league.Index == orderedPlayers.Count)
                {
                    var lastUserLeaderboard = await _hiraishinContext.LeaderboardEntry
                        .Where(x => x.Puuid == player.Puuid && x.QueueType == league.QueueType)
                        .OrderByDescending(x => x.Day)
                        .FirstOrDefaultAsync();

                    league.ArrivedOnBottom = lastUserLeaderboard?.ArrivedOnBottom;
                }
            }
        }

        return allPlayers;
    }

    public async Task<List<MatchApiModel>> GetMatchHistoryAsync(string puuid, int queue, long startTime,long? endTime, int count)
    {
        var matchIds = await GetWithRiotErrorHandlingAsync<List<string>>(
            $"https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?" +
            $"startTime={startTime}" +
            (endTime != null ? $"&endTime={endTime}" : "") +
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

        return await _hiraishinContext.LeaderboardEntry
            .Where(x => x.Day.DayOfWeek == DayOfWeek.Sunday)
            .OrderByDescending(x => x.Day)
            .Take(20)
            .ToListAsync();
    }

    public async Task<List<LeaderboardEntry>> GetPastLeaderboardByUser(string puuid)
    {
        DateTime threeMonthsAgo = DateTime.UtcNow.Date.AddDays(-90);

        return await _hiraishinContext.LeaderboardEntry
            .Include(x => x.Matches.OrderBy(x => x.Id))
            .Where(x => x.Day >= threeMonthsAgo && x.Puuid == puuid)
            .ToListAsync();
    }

    public async Task<ChampionOverview> GetChampionOverview(string championName)
    {
        var matches = await _hiraishinContext.Match
            .AsNoTracking()
            .Where(x => x.ChampionName == championName)
            .Include(x => x.LeaderboardEntry)
            .OrderByDescending(x => x.Id)
            .ToListAsync();

        var players = matches
            .GroupBy(x => x.LeaderboardEntry.Puuid)
            .Select(x => new ChampionOverviewPlayer
            {
                Puuid = x.Key,
                Wins = x.Sum(y => Convert.ToInt32(y.Win)),
                Losses = x.Count() - x.Sum(z => Convert.ToInt32(z.Win)),
                AverageKills = string.Format(CultureInfo.InvariantCulture, "{0:N1}", x.Average(y => y.Kills)),
                AverageDeaths = string.Format(CultureInfo.InvariantCulture, "{0:N1}", x.Average(y => y.Deaths)),
                AverageAssists = string.Format(CultureInfo.InvariantCulture, "{0:N1}", x.Average(y => y.Assists))
            })
            .OrderByDescending(x => (double)x.Wins / (x.Wins + x.Losses))
            .ToList();

        return new ChampionOverview
        {
            Matches = matches,
            Players = players
        };
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

        var allLeagues = new[] { rankedSolo, rankedFlex }
        .Where(l => l != null)
        .Select(l => new LeagueDTO(l))
        .ToList();

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