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
    {
        try
        {
            var players = await _hiraishinService.GetLeaderboard();

            if (players == null || !players.Any())
                return NotFound("Nenhum jogador encontrado.");

            return Ok(players);
        }
        catch (Exception ex)
        {
            // Você pode adicionar um logger aqui também
            return StatusCode(500, $"Erro ao buscar jogadores: {ex.Message}");
        }
    }
    [HttpGet("match-history")]
    public async Task<ActionResult> GetMatchHistory([FromQuery] string puuid, [FromQuery] string queue)
    {
        return Ok(await _hiraishinService.GetMatchHistoryAsync(puuid, queue));
    }

    [HttpGet("weekly-ranking")]
    public async Task<ActionResult<List<WeeklyRanking>>> GetWeeklyRanking()
    {
        return Ok(await _hiraishinService.GetWeeklyRanking());
    }
}