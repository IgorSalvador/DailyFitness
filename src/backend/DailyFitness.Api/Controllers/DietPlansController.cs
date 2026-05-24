using System.Security.Claims;
using DailyFitness.Api.Common.Extensions;
using DailyFitness.Application.Dtos.DietPlan;
using DailyFitness.Application.Interfaces.Services;
using DailyFitness.Domain.ValueObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DailyFitness.Api.Controllers;

/// <summary>
/// Controller responsible for diet plan operations.
/// </summary>
[ApiController, Authorize]
[Route("[controller]")]
public class DietPlansController(IDietPlanService dietPlanService) : ControllerBase
{
    // ── Public listing ────────────────────────────────────────────────────────

    /// <summary>
    /// Lists all active diet plans. Optional filters: objective and level.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAvailablePlans(
        [FromQuery] EDietObjective? objective,
        [FromQuery] EDietLevel? level,
        CancellationToken ct)
    {
        var result = await dietPlanService.GetAvailablePlans(objective, level, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Retrieves details of a specific diet plan.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPlanDetail(Guid id, CancellationToken ct)
    {
        var result = await dietPlanService.GetPlanDetail(id, ct);
        return result.ToActionResult(this);
    }

    // ── Subscription ──────────────────────────────────────────────────────────

    /// <summary>
    /// Subscribes the authenticated user to a diet plan.
    /// The user must not have another active plan.
    /// </summary>
    [HttpPost("{id:guid}/subscribe")]
    public async Task<IActionResult> SubscribePlan(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await dietPlanService.SubscribePlan(id, userId, ct);
        return result.ToActionResult(this);
    }

    // ── Current Plan ──────────────────────────────────────────────────────────

    /// <summary>
    /// Retrieves the authenticated user's currently active diet plan.
    /// </summary>
    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentPlan(CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await dietPlanService.GetCurrentPlan(userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Retrieves progress details of the authenticated user's active diet plan.
    /// </summary>
    [HttpGet("current/progress")]
    public async Task<IActionResult> GetCurrentPlanProgress(CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await dietPlanService.GetCurrentPlanProgress(userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Cancels the authenticated user's active diet plan subscription, preserving history.
    /// </summary>
    [HttpPost("current/cancel")]
    public async Task<IActionResult> CancelSubscription(CancelDietPlanDto model, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await dietPlanService.CancelSubscription(userId, model, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Marks a meal item as completed or incomplete for the current day.
    /// </summary>
    [HttpPost("current/meals/{mealId:guid}/items/{itemId:guid}/complete")]
    public async Task<IActionResult> MarkItemProgress(Guid mealId, Guid itemId, MarkDietItemProgressDto model, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await dietPlanService.MarkItemProgress(userId, mealId, itemId, model, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Finalizes today's session for a specific meal.
    /// </summary>
    [HttpPost("current/meals/{mealId:guid}/finish-day")]
    public async Task<IActionResult> FinishMealDay(Guid mealId, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await dietPlanService.FinishMealDay(userId, mealId, ct);
        return result.ToActionResult(this);
    }

    // ── History ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Returns the full diet plan history of the authenticated user.
    /// </summary>
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory(CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await dietPlanService.GetHistory(userId, ct);
        return result.ToActionResult(this);
    }

    // ── Admin — Management ────────────────────────────────────────────────────

    /// <summary>
    /// Lists all diet plans. Restricted to administrators.
    /// </summary>
    [Authorize(Roles = "Administrator")]
    [HttpGet("management")]
    public async Task<IActionResult> GetAllPlans(CancellationToken ct)
    {
        var result = await dietPlanService.GetAllPlans(ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Retrieves a specific diet plan with full details. Restricted to administrators.
    /// </summary>
    [Authorize(Roles = "Administrator")]
    [HttpGet("management/{id:guid}")]
    public async Task<IActionResult> GetPlan(Guid id, CancellationToken ct)
    {
        var result = await dietPlanService.GetPlan(id, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Creates a new diet plan. Restricted to administrators.
    /// </summary>
    [Authorize(Roles = "Administrator")]
    [HttpPost("management")]
    public async Task<IActionResult> CreatePlan(CreateDietPlanDto model, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await dietPlanService.CreatePlan(model, userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Updates a diet plan. Restricted to administrators.
    /// </summary>
    [Authorize(Roles = "Administrator")]
    [HttpPut("management/{id:guid}")]
    public async Task<IActionResult> UpdatePlan(Guid id, UpdateDietPlanDto model, CancellationToken ct)
    {
        var result = await dietPlanService.UpdatePlan(id, model, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Activates a diet plan. Restricted to administrators.
    /// </summary>
    [Authorize(Roles = "Administrator")]
    [HttpPatch("management/{id:guid}/activate")]
    public async Task<IActionResult> ActivatePlan(Guid id, CancellationToken ct)
    {
        var result = await dietPlanService.ActivatePlan(id, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Deactivates a diet plan. Restricted to administrators.
    /// </summary>
    [Authorize(Roles = "Administrator")]
    [HttpPatch("management/{id:guid}/deactivate")]
    public async Task<IActionResult> DeactivatePlan(Guid id, CancellationToken ct)
    {
        var result = await dietPlanService.DeactivatePlan(id, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Lists all subscribers of a diet plan. Restricted to administrators.
    /// </summary>
    [Authorize(Roles = "Administrator")]
    [HttpGet("management/{id:guid}/subscribers")]
    public async Task<IActionResult> GetPlanSubscribers(Guid id, CancellationToken ct)
    {
        var result = await dietPlanService.GetPlanSubscribers(id, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Returns the progress of a specific subscriber. Restricted to administrators.
    /// </summary>
    [Authorize(Roles = "Administrator")]
    [HttpGet("management/{id:guid}/subscribers/{userId:guid}/progress")]
    public async Task<IActionResult> GetSubscriberProgress(Guid id, Guid userId, CancellationToken ct)
    {
        var result = await dietPlanService.GetSubscriberProgress(id, userId, ct);
        return result.ToActionResult(this);
    }

    // ── Professional — Management ─────────────────────────────────────────────

    /// <summary>
    /// Lists all diet plans created by the authenticated professional.
    /// </summary>
    [Authorize(Roles = "Professional")]
    [HttpGet("managed")]
    public async Task<IActionResult> GetManagedPlans(CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await dietPlanService.GetManagedPlans(userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Retrieves a specific plan created by the authenticated professional.
    /// </summary>
    [Authorize(Roles = "Professional")]
    [HttpGet("managed/{id:guid}")]
    public async Task<IActionResult> GetManagedPlan(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await dietPlanService.GetManagedPlan(id, userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Creates a new diet plan as the authenticated professional.
    /// </summary>
    [Authorize(Roles = "Professional")]
    [HttpPost("managed")]
    public async Task<IActionResult> CreateManagedPlan(CreateDietPlanDto model, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await dietPlanService.CreateManagedPlan(model, userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Updates a diet plan created by the authenticated professional.
    /// </summary>
    [Authorize(Roles = "Professional")]
    [HttpPut("managed/{id:guid}")]
    public async Task<IActionResult> UpdateManagedPlan(Guid id, UpdateDietPlanDto model, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await dietPlanService.UpdateManagedPlan(id, model, userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Activates a plan created by the authenticated professional.
    /// </summary>
    [Authorize(Roles = "Professional")]
    [HttpPatch("managed/{id:guid}/activate")]
    public async Task<IActionResult> ActivateManagedPlan(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await dietPlanService.ActivateManagedPlan(id, userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Deactivates a plan created by the authenticated professional.
    /// </summary>
    [Authorize(Roles = "Professional")]
    [HttpPatch("managed/{id:guid}/deactivate")]
    public async Task<IActionResult> DeactivateManagedPlan(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await dietPlanService.DeactivateManagedPlan(id, userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Lists subscribers of a plan created by the authenticated professional.
    /// </summary>
    [Authorize(Roles = "Professional")]
    [HttpGet("managed/{id:guid}/subscribers")]
    public async Task<IActionResult> GetManagedPlanSubscribers(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await dietPlanService.GetManagedPlanSubscribers(id, userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Returns progress of a subscriber in a plan created by the authenticated professional.
    /// </summary>
    [Authorize(Roles = "Professional")]
    [HttpGet("managed/{id:guid}/subscribers/{subscriberUserId:guid}/progress")]
    public async Task<IActionResult> GetManagedSubscriberProgress(Guid id, Guid subscriberUserId, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await dietPlanService.GetManagedSubscriberProgress(id, subscriberUserId, userId, ct);
        return result.ToActionResult(this);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "");
}
