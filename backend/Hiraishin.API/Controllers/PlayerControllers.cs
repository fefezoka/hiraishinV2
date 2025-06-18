using Microsoft.AspNetCore.Mvc;
using Hiraishin.Services;
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
}