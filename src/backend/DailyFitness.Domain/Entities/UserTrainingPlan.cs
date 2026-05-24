using DailyFitness.Domain.Common;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Domain.Entities;

public class UserTrainingPlan : Entity
{
    public Guid UserId { get; private set; }
    public Guid TrainingPlanId { get; private set; }
    public EUserTrainingPlanStatus UserTrainingPlanStatus { get; private set; }
    public DateTime StartedAt { get; private set; }
    public DateTime? CancelledAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public string? CancellationReason { get; private set; }

    public User? User { get; set; }
    public TrainingPlan? TrainingPlan { get; set; }
    public ICollection<UserTrainingProgress> Progresses { get; init; }
    public ICollection<UserTrainingWorkoutDailyLog> DailyLogs { get; init; }

    public UserTrainingPlan()
    {
        Progresses = new List<UserTrainingProgress>();
        DailyLogs = new List<UserTrainingWorkoutDailyLog>();
    }

    public UserTrainingPlan(Guid userId, Guid trainingPlanId) : base()
    {
        UserId = userId;
        TrainingPlanId = trainingPlanId;
        UserTrainingPlanStatus = EUserTrainingPlanStatus.Active;
        StartedAt = DateTime.Now;
        Progresses = new List<UserTrainingProgress>();
        DailyLogs = new List<UserTrainingWorkoutDailyLog>();
    }

    public void Cancel(string? reason = null)
    {
        UserTrainingPlanStatus = EUserTrainingPlanStatus.Cancelled;
        CancelledAt = DateTime.Now;
        CancellationReason = reason;
        UpdatedAt = DateTime.Now;
    }

    public void Complete()
    {
        UserTrainingPlanStatus = EUserTrainingPlanStatus.Completed;
        CompletedAt = DateTime.Now;
        UpdatedAt = DateTime.Now;
    }

    public bool IsActive() => UserTrainingPlanStatus == EUserTrainingPlanStatus.Active;
}
