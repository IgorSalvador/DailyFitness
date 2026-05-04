using System.Security.Claims;
using DailyFitness.Api.Common.Extensions;
using DailyFitness.Application.Dtos.Challenge;
using DailyFitness.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DailyFitness.Api.Controllers;

/// <summary>
/// Controller responsible for managing fitness challenges and user participation.
/// </summary>
[ApiController, Authorize]
[Route("[controller]")]
public class ChallengesController(IChallengeService challengeService) : ControllerBase
{
    // ── Admin ────────────────────────────────────────────────────────────────

    /// <summary>
    /// Retrieves all challenges with participant counts. Restricted to administrators.
    /// </summary>
    [Authorize(Roles = "Administrator")]
    [HttpGet]
    public async Task<IActionResult> GetChallenges(CancellationToken ct)
    {
        var result = await challengeService.GetChallenges(ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Retrieves a specific challenge by its identifier. Restricted to administrators.
    /// </summary>
    /// <param name="id">The unique identifier of the challenge.</param>
    [Authorize(Roles = "Administrator")]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetChallenge(Guid id, CancellationToken ct)
    {
        var result = await challengeService.GetChallenge(id, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Creates a new fitness challenge. Restricted to administrators.
    /// </summary>
    /// <param name="model">The challenge creation data.</param>
    [Authorize(Roles = "Administrator")]
    [HttpPost]
    public async Task<IActionResult> CreateChallenge(CreateChallengeDto model, CancellationToken ct)
    {
        var result = await challengeService.CreateChallenge(model, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Updates an existing challenge. Restricted to administrators.
    /// Type can only be changed if there are no participants.
    /// </summary>
    /// <param name="id">The unique identifier of the challenge.</param>
    /// <param name="model">The updated challenge data.</param>
    [Authorize(Roles = "Administrator")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateChallenge(Guid id, UpdateChallengeDto model, CancellationToken ct)
    {
        var result = await challengeService.UpdateChallenge(id, model, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Discontinues a challenge, notifying all active participants. Restricted to administrators.
    /// </summary>
    /// <param name="id">The unique identifier of the challenge.</param>
    [Authorize(Roles = "Administrator")]
    [HttpPatch("{id:guid}/discontinue")]
    public async Task<IActionResult> DiscontinueChallenge(Guid id, CancellationToken ct)
    {
        var result = await challengeService.DiscontinueChallenge(id, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Retrieves all participants of a specific challenge. Restricted to administrators.
    /// </summary>
    /// <param name="id">The unique identifier of the challenge.</param>
    [Authorize(Roles = "Administrator")]
    [HttpGet("{id:guid}/participants")]
    public async Task<IActionResult> GetChallengeParticipants(Guid id, CancellationToken ct)
    {
        var result = await challengeService.GetChallengeParticipants(id, ct);
        return result.ToActionResult(this);
    }

    // ── User ─────────────────────────────────────────────────────────────────

    /// <summary>
    /// Retrieves challenges available for the authenticated user to join.
    /// Excludes expired, discontinued, and already-joined challenges.
    /// </summary>
    [HttpGet("available")]
    public async Task<IActionResult> GetAvailableChallenges(CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "");

        var result = await challengeService.GetAvailableChallenges(userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Joins the authenticated user to a specific challenge.
    /// </summary>
    /// <param name="id">The unique identifier of the challenge to join.</param>
    [HttpPost("{id:guid}/join")]
    public async Task<IActionResult> JoinChallenge(Guid id, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "");

        var result = await challengeService.JoinChallenge(id, userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Retrieves all challenges the authenticated user has participated in.
    /// </summary>
    [HttpGet("my")]
    public async Task<IActionResult> GetMyChallenges(CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "");

        var result = await challengeService.GetMyChallenges(userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Retrieves the details and full progress history of a specific participation.
    /// </summary>
    /// <param name="userChallengeId">The unique identifier of the user's participation.</param>
    [HttpGet("my/{userChallengeId:guid}")]
    public async Task<IActionResult> GetMyChallengeDetails(Guid userChallengeId, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "");

        var result = await challengeService.GetMyChallengeDetails(userChallengeId, userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Updates the progress of the authenticated user in a specific challenge.
    /// Enforces period rules based on the challenge type (Daily/Weekly/Monthly).
    /// </summary>
    /// <param name="userChallengeId">The unique identifier of the user's participation.</param>
    /// <param name="model">The progress update data.</param>
    [HttpPut("my/{userChallengeId:guid}/progress")]
    public async Task<IActionResult> UpdateProgress(Guid userChallengeId, UpdateChallengeProgressDto model, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "");

        var result = await challengeService.UpdateProgress(userChallengeId, userId, model, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Removes the authenticated user from a challenge, preserving participation history.
    /// </summary>
    /// <param name="userChallengeId">The unique identifier of the user's participation.</param>
    [HttpPatch("my/{userChallengeId:guid}/leave")]
    public async Task<IActionResult> LeaveChallenge(Guid userChallengeId, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "");

        var result = await challengeService.LeaveChallenge(userChallengeId, userId, ct);
        return result.ToActionResult(this);
    }

    // ── Professional ─────────────────────────────────────────────────────────

    /// <summary>
    /// Lists all challenges created by the authenticated professional.
    /// </summary>
    [Authorize(Roles = "Professional")]
    [HttpGet("managed")]
    public async Task<IActionResult> GetManagedChallenges(CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "");

        var result = await challengeService.GetManagedChallenges(userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Retrieves a specific challenge created by the authenticated professional.
    /// </summary>
    [Authorize(Roles = "Professional")]
    [HttpGet("managed/{id:guid}")]
    public async Task<IActionResult> GetManagedChallenge(Guid id, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "");

        var result = await challengeService.GetManagedChallenge(id, userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Creates a new challenge as the authenticated professional.
    /// </summary>
    [Authorize(Roles = "Professional")]
    [HttpPost("managed")]
    public async Task<IActionResult> CreateManagedChallenge(CreateChallengeDto model, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "");

        var result = await challengeService.CreateManagedChallenge(model, userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Updates a challenge created by the authenticated professional.
    /// </summary>
    [Authorize(Roles = "Professional")]
    [HttpPut("managed/{id:guid}")]
    public async Task<IActionResult> UpdateManagedChallenge(Guid id, UpdateChallengeDto model, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "");

        var result = await challengeService.UpdateManagedChallenge(id, model, userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Discontinues a challenge created by the authenticated professional,
    /// notifying all active participants.
    /// </summary>
    [Authorize(Roles = "Professional")]
    [HttpPatch("managed/{id:guid}/discontinue")]
    public async Task<IActionResult> DiscontinueManagedChallenge(Guid id, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "");

        var result = await challengeService.DiscontinueManagedChallenge(id, userId, ct);
        return result.ToActionResult(this);
    }
}
