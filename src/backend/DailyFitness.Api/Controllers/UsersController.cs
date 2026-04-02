using System.Security.Claims;
using DailyFitness.Api.Common.Extensions;
using DailyFitness.Application.Dtos.Authentication;
using DailyFitness.Application.Dtos.Users;
using DailyFitness.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace DailyFitness.Api.Controllers;

/// <summary>
/// Represents a controller responsible for managing user-related operations
/// such as registration, authentication, and password management.
/// </summary>
[ApiController]
[Route("[controller]")]
public class UsersController(IUserService userService) : ControllerBase
{
    /// <summary>
    /// Registers a new user in the system.
    /// </summary>
    /// <param name="model">The user registration details encapsulated in a <see cref="CreateUserDto"/> object.</param>
    /// <param name="ct">A <see cref="CancellationToken"/> to observe while waiting for the task to complete.</param>
    /// <returns>An <see cref="IActionResult"/> that contains the result of the registration process.</returns>
    [HttpPost("register")]
    public async Task<IActionResult> Register(CreateUserDto model, CancellationToken ct)
    {
        var result = await userService.RegisterUser(model, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Authenticates a user and generates an authentication token.
    /// </summary>
    /// <param name="model">The login details encapsulated in a <see cref="LoginDto"/> object.</param>
    /// <param name="ct">A <see cref="CancellationToken"/> to observe while waiting for the task to complete.</param>
    /// <returns>An <see cref="IActionResult"/> that contains the result of the authentication process.</returns>
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto model, CancellationToken ct)
    {
        var result = await userService.Authenticate(model, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Initiates a password reset request for a user by sending an email with further instructions.
    /// </summary>
    /// <param name="model">An object containing the email address of the user requesting the password reset, encapsulated in a <see cref="ResetUserPasswordRequestDto"/>.</param>
    /// <param name="ct">A <see cref="CancellationToken"/> to observe while awaiting the completion of the task.</param>
    /// <returns>An <see cref="IActionResult"/> that contains the result of the password reset request process.</returns>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ResetUserPasswordRequestDto model, CancellationToken ct)
    {
        var result = await userService.ResetPasswordRequest(model, ApiConfiguration.FrontendUri, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Resets the password of a user based on the provided reset token and new password details.
    /// </summary>
    /// <param name="model">The reset password request details encapsulated in a <see cref="ResetUserPasswordDto"/> object.</param>
    /// <param name="ct">A <see cref="CancellationToken"/> to observe while waiting for the task to complete.</param>
    /// <returns>An <see cref="IActionResult"/> that contains the result of the password reset operation.</returns>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetUserPasswordDto model, CancellationToken ct)
    {
        var result = await userService.ResetPassword(model, ct);
        return result.ToActionResult(this);
    }

    [HttpGet("get-profile/{userId:guid}")]
    public async Task<IActionResult> GetProfile(Guid userId, CancellationToken ct)
    {
        var loggedUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "");

        var result = await userService.GetProfile(userId, loggedUserId, ct);
        return result.ToActionResult(this);
    }
}
