using Microsoft.AspNetCore.Mvc;
using Hiraishin.Domain.Interface.Services;

namespace Hiraishin.API.Controllers;

[ApiController]
[Route("hiraishin")]
public class PlayersController : ControllerBase
{
    private readonly IHiraishinService _lolApiProvider;
    
    public PlayersController(IHiraishinService lolApiProvider)
    {
        _lolApiProvider = lolApiProvider;
    }

    [HttpGet("leaderboard")]
    public async Task<IActionResult> GetLeaderboard()
    {
        try
        {
            var players = await _lolApiProvider.GetLeaderboard();

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
        var result = await _lolApiProvider.GetMatchHistoryAsync(puuid, queue);
        return Ok(result);
    }
}