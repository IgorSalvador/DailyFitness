using DailyFitness.Domain.Common;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Domain.Entities;

public class UserDietPlan : Entity
{
    public Guid UserId { get; private set; }
    public Guid DietPlanId { get; private set; }
    public EUserDietPlanStatus UserDietPlanStatus { get; private set; }
    public DateTime StartedAt { get; private set; }
    public DateTime? CancelledAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public string? CancellationReason { get; private set; }

    public User? User { get; set; }
    public DietPlan? DietPlan { get; set; }
    public ICollection<UserDietProgress> Progresses { get; init; }
    public ICollection<UserDietMealDailyLog> DailyLogs { get; init; }

    public UserDietPlan()
    {
        Progresses = new List<UserDietProgress>();
        DailyLogs = new List<UserDietMealDailyLog>();
    }

    public UserDietPlan(Guid userId, Guid dietPlanId) : base()
    {
        UserId = userId;
        DietPlanId = dietPlanId;
        UserDietPlanStatus = EUserDietPlanStatus.Active;
        StartedAt = DateTime.Now;
        Progresses = new List<UserDietProgress>();
        DailyLogs = new List<UserDietMealDailyLog>();
    }

    public void Cancel(string? reason = null)
    {
        UserDietPlanStatus = EUserDietPlanStatus.Cancelled;
        CancelledAt = DateTime.Now;
        CancellationReason = reason;
        UpdatedAt = DateTime.Now;
    }

    public void Complete()
    {
        UserDietPlanStatus = EUserDietPlanStatus.Completed;
        CompletedAt = DateTime.Now;
        UpdatedAt = DateTime.Now;
    }

    public bool IsActive() => UserDietPlanStatus == EUserDietPlanStatus.Active;
}
