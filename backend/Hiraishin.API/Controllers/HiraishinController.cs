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
    public async Task<IActionResult> GetLeaderboard()
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
    public async Task<IActionResult> GetMatchHistory([FromQuery] string puuid, [FromQuery] string queue)
    {
        var result = await _hiraishinService.GetMatchHistoryAsync(puuid, queue);
        return Ok(result);
    }

    [HttpGet("teste")]
    public async Task<List<WeeklyRanking>> Teste()
    {
        return await _hiraishinService.Teste();
    }
}