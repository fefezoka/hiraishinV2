using Microsoft.AspNetCore.Mvc;
using Hiraishin.Domain.Interface.Services;

namespace Hiraishin.Controllers;

[ApiController]
[Route("api/players")]
public class PlayersController : ControllerBase
{
    private readonly ILolApiProvider _lolApiProvider;
    
    public PlayersController(ILolApiProvider lolApiProvider)
    {
        _lolApiProvider = lolApiProvider;
    }

    [HttpGet]
    public async Task<IActionResult> GetPlayers()
    {
        var players = await _lolApiProvider.GetAllPlayers();
        return Ok(players);
    }
    [HttpGet("detailed")]
    public async Task<IActionResult> GetAllPlayersDetailed()
    {
        try
        {
            var players = await _lolApiProvider.GetAllPlayersDetailed();

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
}