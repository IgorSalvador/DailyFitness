using DailyFitness.Application.Common.Results;
using DailyFitness.Application.Dtos.TrainingPlan;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Interfaces.Services;

public interface ITrainingPlanService
{
    // ── Admin ─────────────────────────────────────────────────────────────────
    Task<ResultDto<IEnumerable<TrainingPlanDto>>> GetAllPlans(CancellationToken ct);
    Task<ResultDto<TrainingPlanDto>> GetPlan(Guid id, CancellationToken ct);
    Task<ResultDto<TrainingPlanDto>> CreatePlan(CreateTrainingPlanDto model, Guid creatorId, CancellationToken ct);
    Task<ResultDto<TrainingPlanDto>> UpdatePlan(Guid id, UpdateTrainingPlanDto model, CancellationToken ct);
    Task<ResultDto<TrainingPlanDto>> ActivatePlan(Guid id, CancellationToken ct);
    Task<ResultDto<TrainingPlanDto>> DeactivatePlan(Guid id, CancellationToken ct);
    Task<ResultDto<IEnumerable<TrainingPlanSubscriberDto>>> GetPlanSubscribers(Guid planId, CancellationToken ct);
    Task<ResultDto<UserTrainingPlanDto>> GetSubscriberProgress(Guid planId, Guid userId, CancellationToken ct);

    // ── Professional ──────────────────────────────────────────────────────────
    Task<ResultDto<IEnumerable<TrainingPlanDto>>> GetManagedPlans(Guid creatorId, CancellationToken ct);
    Task<ResultDto<TrainingPlanDto>> GetManagedPlan(Guid id, Guid creatorId, CancellationToken ct);
    Task<ResultDto<TrainingPlanDto>> CreateManagedPlan(CreateTrainingPlanDto model, Guid creatorId, CancellationToken ct);
    Task<ResultDto<TrainingPlanDto>> UpdateManagedPlan(Guid id, UpdateTrainingPlanDto model, Guid creatorId, CancellationToken ct);
    Task<ResultDto<TrainingPlanDto>> ActivateManagedPlan(Guid id, Guid creatorId, CancellationToken ct);
    Task<ResultDto<TrainingPlanDto>> DeactivateManagedPlan(Guid id, Guid creatorId, CancellationToken ct);
    Task<ResultDto<IEnumerable<TrainingPlanSubscriberDto>>> GetManagedPlanSubscribers(Guid planId, Guid creatorId, CancellationToken ct);
    Task<ResultDto<UserTrainingPlanDto>> GetManagedSubscriberProgress(Guid planId, Guid userId, Guid creatorId, CancellationToken ct);

    // ── User ──────────────────────────────────────────────────────────────────
    Task<ResultDto<IEnumerable<TrainingPlanDto>>> GetAvailablePlans(ETrainingObjective? objective, ETrainingLevel? level, CancellationToken ct);
    Task<ResultDto<TrainingPlanDto>> GetPlanDetail(Guid id, CancellationToken ct);
    Task<ResultDto<UserTrainingPlanDto>> SubscribePlan(Guid planId, Guid userId, CancellationToken ct);
    Task<ResultDto<UserTrainingPlanDto>> CancelSubscription(Guid userId, CancelTrainingPlanDto model, CancellationToken ct);
    Task<ResultDto<UserTrainingPlanDto>> GetCurrentPlan(Guid userId, CancellationToken ct);
    Task<ResultDto<UserTrainingPlanDto>> GetCurrentPlanProgress(Guid userId, CancellationToken ct);
    Task<ResultDto<UserTrainingPlanDto>> MarkItemProgress(Guid userId, Guid workoutId, Guid itemId, MarkTrainingItemProgressDto model, CancellationToken ct);
    Task<ResultDto<UserTrainingWorkoutDailyLogDto>> FinishWorkoutDay(Guid userId, Guid workoutId, CancellationToken ct);
    Task<ResultDto<IEnumerable<UserTrainingPlanDto>>> GetHistory(Guid userId, CancellationToken ct);
}
