using Microsoft.AspNetCore.Mvc;
using Hiraishin.Domain.Interface.Services;
using Hiraishin.Domain.Entities;

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
    public async Task<ActionResult> GetLeaderboard()
        => Ok(await _hiraishinService.GetLeaderboard());

    [HttpGet("match-history")]
    public async Task<ActionResult> GetMatchHistory([FromQuery] string puuid, [FromQuery] string queue)
        => Ok(await _hiraishinService.GetMatchHistoryAsync(puuid, queue));

    [HttpGet("weekly-ranking")]
    public async Task<ActionResult<List<WeeklyRanking>>> GetWeeklyRanking()
        => Ok(await _hiraishinService.GetWeeklyRanking());

    [HttpGet("weekly-ranking/{puuid}")]
    public async Task<ActionResult<List<WeeklyRanking>>> GetWeeklyRankingByUser([FromRoute] string puuid)
        => Ok(await _hiraishinService.GetWeeklyRankingByUser(puuid));
}