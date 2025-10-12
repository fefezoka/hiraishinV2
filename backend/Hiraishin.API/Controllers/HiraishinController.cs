using Hiraishin.Domain.Dto.Hiraishin;
using Hiraishin.Domain.Entities;
using Hiraishin.Domain.Interface.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hiraishin.API.Controllers;

[ApiController]
[Route("hiraishin")]
public class PlayersController : ControllerBase
{
    private readonly IHiraishinService _hiraishinService;

    public PlayersController(IHiraishinService hiraishinService)
    {
        _hiraishinService = hiraishinService;
    }

    [HttpGet("leaderboard")]
    public async Task<ActionResult<List<PlayerInfoDTO>>> GetLeaderboard()
        => Ok(await _hiraishinService.GetLeaderboard());

    [HttpGet("match-history")]
    public async Task<ActionResult<List<MatchApiModel>>> GetMatchHistory([FromQuery] string puuid, [FromQuery] int queue)
        => Ok(await _hiraishinService.GetMatchHistoryAsync(puuid, queue));

    [HttpGet("past-leaderboard/last-week")]
    public async Task<ActionResult<List<LeaderboardEntry>>> GetLastWeekLeaderboard()
        => Ok(await _hiraishinService.GetLastWeekLeaderboard());

    [HttpGet("past-leaderboard/by-user/{puuid}")]
    public async Task<ActionResult<List<LeaderboardEntry>>> GetPastLeaderboardByUser([FromRoute] string puuid)
        => Ok(await _hiraishinService.GetPastLeaderboardByUser(puuid));

    [HttpGet("champion-overview")]
    public async Task<ActionResult<ChampionOverview>> GetChampionOverview([FromQuery] string championName, [FromQuery] int queue)
        => Ok(await _hiraishinService.GetChampionOverview(championName, queue));
}