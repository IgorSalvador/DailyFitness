using System.Security.Claims;
using DailyFitness.Api.Common.Extensions;
using DailyFitness.Application.Dtos.TrainingPlan;
using DailyFitness.Application.Interfaces.Services;
using DailyFitness.Domain.ValueObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DailyFitness.Api.Controllers;

/// <summary>
/// Controller responsible for training plan operations available to regular users.
/// </summary>
[ApiController, Authorize]
[Route("[controller]")]
public class TrainingPlansController(ITrainingPlanService trainingPlanService) : ControllerBase
{
    // ── Public listing ────────────────────────────────────────────────────────

    /// <summary>
    /// Lists all active training plans. Optional filters: objective and level.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAvailablePlans(
        [FromQuery] ETrainingObjective? objective,
        [FromQuery] ETrainingLevel? level,
        CancellationToken ct)
    {
        var result = await trainingPlanService.GetAvailablePlans(objective, level, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Retrieves details of a specific training plan.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPlanDetail(Guid id, CancellationToken ct)
    {
        var result = await trainingPlanService.GetPlanDetail(id, ct);
        return result.ToActionResult(this);
    }

    // ── Subscription ──────────────────────────────────────────────────────────

    /// <summary>
    /// Subscribes the authenticated user to a training plan.
    /// The user must not have another active plan.
    /// </summary>
    [HttpPost("{id:guid}/subscribe")]
    public async Task<IActionResult> SubscribePlan(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await trainingPlanService.SubscribePlan(id, userId, ct);
        return result.ToActionResult(this);
    }

    // ── Current Plan ──────────────────────────────────────────────────────────

    /// <summary>
    /// Retrieves the authenticated user's currently active training plan.
    /// </summary>
    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentPlan(CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await trainingPlanService.GetCurrentPlan(userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Retrieves progress details of the authenticated user's active plan.
    /// </summary>
    [HttpGet("current/progress")]
    public async Task<IActionResult> GetCurrentPlanProgress(CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await trainingPlanService.GetCurrentPlanProgress(userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Cancels the authenticated user's active plan subscription, preserving history.
    /// </summary>
    [HttpPost("current/cancel")]
    public async Task<IActionResult> CancelSubscription(CancelTrainingPlanDto model, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await trainingPlanService.CancelSubscription(userId, model, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Marks a workout item as completed for the current day.
    /// Prevents duplicate marking of the same item on the same day.
    /// </summary>
    [HttpPost("current/workouts/{workoutId:guid}/items/{itemId:guid}/complete")]
    public async Task<IActionResult> MarkItemProgress(Guid workoutId, Guid itemId, MarkTrainingItemProgressDto model, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await trainingPlanService.MarkItemProgress(userId, workoutId, itemId, model, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Finishes today's workout session when all required items have been completed.
    /// </summary>
    [HttpPost("current/workouts/{workoutId:guid}/finish-day")]
    public async Task<IActionResult> FinishWorkoutDay(Guid workoutId, FinishWorkoutDayDto model, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await trainingPlanService.FinishWorkoutDay(userId, workoutId, model, ct);
        return result.ToActionResult(this);
    }

    // ── History ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Returns the full training plan history of the authenticated user (active, cancelled, completed).
    /// </summary>
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory(CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await trainingPlanService.GetHistory(userId, ct);
        return result.ToActionResult(this);
    }

    // ── Admin — Management ────────────────────────────────────────────────────

    /// <summary>
    /// Lists all training plans. Restricted to administrators.
    /// </summary>
    [Authorize(Roles = "Administrator")]
    [HttpGet("management")]
    public async Task<IActionResult> GetAllPlans(CancellationToken ct)
    {
        var result = await trainingPlanService.GetAllPlans(ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Retrieves a specific training plan with full details. Restricted to administrators.
    /// </summary>
    [Authorize(Roles = "Administrator")]
    [HttpGet("management/{id:guid}")]
    public async Task<IActionResult> GetPlan(Guid id, CancellationToken ct)
    {
        var result = await trainingPlanService.GetPlan(id, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Creates a new training plan. Restricted to administrators.
    /// </summary>
    [Authorize(Roles = "Administrator")]
    [HttpPost("management")]
    public async Task<IActionResult> CreatePlan(CreateTrainingPlanDto model, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await trainingPlanService.CreatePlan(model, userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Updates a training plan. Restricted to administrators.
    /// </summary>
    [Authorize(Roles = "Administrator")]
    [HttpPut("management/{id:guid}")]
    public async Task<IActionResult> UpdatePlan(Guid id, UpdateTrainingPlanDto model, CancellationToken ct)
    {
        var result = await trainingPlanService.UpdatePlan(id, model, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Activates a training plan. Restricted to administrators.
    /// </summary>
    [Authorize(Roles = "Administrator")]
    [HttpPatch("management/{id:guid}/activate")]
    public async Task<IActionResult> ActivatePlan(Guid id, CancellationToken ct)
    {
        var result = await trainingPlanService.ActivatePlan(id, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Deactivates a training plan. Restricted to administrators.
    /// </summary>
    [Authorize(Roles = "Administrator")]
    [HttpPatch("management/{id:guid}/deactivate")]
    public async Task<IActionResult> DeactivatePlan(Guid id, CancellationToken ct)
    {
        var result = await trainingPlanService.DeactivatePlan(id, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Lists all subscribers of a training plan. Restricted to administrators.
    /// </summary>
    [Authorize(Roles = "Administrator")]
    [HttpGet("management/{id:guid}/subscribers")]
    public async Task<IActionResult> GetPlanSubscribers(Guid id, CancellationToken ct)
    {
        var result = await trainingPlanService.GetPlanSubscribers(id, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Returns the progress of a specific subscriber. Restricted to administrators.
    /// </summary>
    [Authorize(Roles = "Administrator")]
    [HttpGet("management/{id:guid}/subscribers/{userId:guid}/progress")]
    public async Task<IActionResult> GetSubscriberProgress(Guid id, Guid userId, CancellationToken ct)
    {
        var result = await trainingPlanService.GetSubscriberProgress(id, userId, ct);
        return result.ToActionResult(this);
    }

    // ── Professional — Management ──────────────────────────────────────────────

    /// <summary>
    /// Lists all training plans created by the authenticated professional.
    /// </summary>
    [Authorize(Roles = "Professional")]
    [HttpGet("managed")]
    public async Task<IActionResult> GetManagedPlans(CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await trainingPlanService.GetManagedPlans(userId, ct);
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
        var result = await trainingPlanService.GetManagedPlan(id, userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Creates a new training plan as the authenticated professional.
    /// </summary>
    [Authorize(Roles = "Professional")]
    [HttpPost("managed")]
    public async Task<IActionResult> CreateManagedPlan(CreateTrainingPlanDto model, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await trainingPlanService.CreateManagedPlan(model, userId, ct);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Updates a training plan created by the authenticated professional.
    /// </summary>
    [Authorize(Roles = "Professional")]
    [HttpPut("managed/{id:guid}")]
    public async Task<IActionResult> UpdateManagedPlan(Guid id, UpdateTrainingPlanDto model, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await trainingPlanService.UpdateManagedPlan(id, model, userId, ct);
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
        var result = await trainingPlanService.ActivateManagedPlan(id, userId, ct);
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
        var result = await trainingPlanService.DeactivateManagedPlan(id, userId, ct);
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
        var result = await trainingPlanService.GetManagedPlanSubscribers(id, userId, ct);
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
        var result = await trainingPlanService.GetManagedSubscriberProgress(id, subscriberUserId, userId, ct);
        return result.ToActionResult(this);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "");
}
