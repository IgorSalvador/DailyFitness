using DailyFitness.Application.Common.Results;
using DailyFitness.Application.Dtos.DietPlan;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Interfaces.Services;

public interface IDietPlanService
{
    // ── Admin ─────────────────────────────────────────────────────────────────
    Task<ResultDto<IEnumerable<DietPlanDto>>> GetAllPlans(CancellationToken ct);
    Task<ResultDto<DietPlanDto>> GetPlan(Guid id, CancellationToken ct);
    Task<ResultDto<DietPlanDto>> CreatePlan(CreateDietPlanDto model, Guid creatorId, CancellationToken ct);
    Task<ResultDto<DietPlanDto>> UpdatePlan(Guid id, UpdateDietPlanDto model, CancellationToken ct);
    Task<ResultDto<DietPlanDto>> ActivatePlan(Guid id, CancellationToken ct);
    Task<ResultDto<DietPlanDto>> DeactivatePlan(Guid id, CancellationToken ct);
    Task<ResultDto<IEnumerable<DietPlanSubscriberDto>>> GetPlanSubscribers(Guid planId, CancellationToken ct);
    Task<ResultDto<UserDietPlanDto>> GetSubscriberProgress(Guid planId, Guid userId, CancellationToken ct);

    // ── Professional ──────────────────────────────────────────────────────────
    Task<ResultDto<IEnumerable<DietPlanDto>>> GetManagedPlans(Guid creatorId, CancellationToken ct);
    Task<ResultDto<DietPlanDto>> GetManagedPlan(Guid id, Guid creatorId, CancellationToken ct);
    Task<ResultDto<DietPlanDto>> CreateManagedPlan(CreateDietPlanDto model, Guid creatorId, CancellationToken ct);
    Task<ResultDto<DietPlanDto>> UpdateManagedPlan(Guid id, UpdateDietPlanDto model, Guid creatorId, CancellationToken ct);
    Task<ResultDto<DietPlanDto>> ActivateManagedPlan(Guid id, Guid creatorId, CancellationToken ct);
    Task<ResultDto<DietPlanDto>> DeactivateManagedPlan(Guid id, Guid creatorId, CancellationToken ct);
    Task<ResultDto<IEnumerable<DietPlanSubscriberDto>>> GetManagedPlanSubscribers(Guid planId, Guid creatorId, CancellationToken ct);
    Task<ResultDto<UserDietPlanDto>> GetManagedSubscriberProgress(Guid planId, Guid userId, Guid creatorId, CancellationToken ct);

    // ── User ──────────────────────────────────────────────────────────────────
    Task<ResultDto<IEnumerable<DietPlanDto>>> GetAvailablePlans(EDietObjective? objective, EDietLevel? level, CancellationToken ct);
    Task<ResultDto<DietPlanDto>> GetPlanDetail(Guid id, CancellationToken ct);
    Task<ResultDto<UserDietPlanDto>> SubscribePlan(Guid planId, Guid userId, CancellationToken ct);
    Task<ResultDto<UserDietPlanDto>> CancelSubscription(Guid userId, CancelDietPlanDto model, CancellationToken ct);
    Task<ResultDto<UserDietPlanDto>> GetCurrentPlan(Guid userId, CancellationToken ct);
    Task<ResultDto<UserDietPlanDto>> GetCurrentPlanProgress(Guid userId, CancellationToken ct);
    Task<ResultDto<UserDietPlanDto>> MarkItemProgress(Guid userId, Guid mealId, Guid itemId, MarkDietItemProgressDto model, CancellationToken ct);
    Task<ResultDto<UserDietMealDailyLogDto>> FinishMealDay(Guid userId, Guid mealId, DateOnly? progressDate, CancellationToken ct);
    Task<ResultDto<IEnumerable<UserDietPlanDto>>> GetHistory(Guid userId, CancellationToken ct);
}
