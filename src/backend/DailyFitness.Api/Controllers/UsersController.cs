using DailyFitness.Api.Common.Extensions;
using DailyFitness.Application.Dtos.Authentication;
using DailyFitness.Application.Dtos.Users;
using DailyFitness.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DailyFitness.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class UsersController(IUserService userService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(CreateUserDto model, CancellationToken ct)
    {
        var result = await userService.RegisterUser(model, ct);
        return result.ToActionResult(this);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto model, CancellationToken ct)
    {
        var result = await userService.Authenticate(model, ct);
        return result.ToActionResult(this);
    }
}
