using DailyFitness.Domain.Common;

namespace DailyFitness.Domain.Entities;

public class UserTrainingWorkoutDailyLog : Entity
{
    public Guid UserTrainingPlanId { get; private set; }
    public Guid TrainingWorkoutId { get; private set; }
    public DateTime ProgressDate { get; private set; }
    public decimal ProgressPercentage { get; private set; }
    public bool IsFinished { get; private set; }
    public DateTime? FinishedAt { get; private set; }

    public UserTrainingPlan? UserTrainingPlan { get; set; }
    public TrainingWorkout? TrainingWorkout { get; set; }

    public UserTrainingWorkoutDailyLog()
    {
    }

    public UserTrainingWorkoutDailyLog(
        Guid userTrainingPlanId,
        Guid trainingWorkoutId,
        DateTime progressDate,
        decimal progressPercentage) : base()
    {
        UserTrainingPlanId = userTrainingPlanId;
        TrainingWorkoutId = trainingWorkoutId;
        ProgressDate = progressDate;
        ProgressPercentage = progressPercentage;
    }

    public void UpdateProgress(decimal progressPercentage)
    {
        ProgressPercentage = progressPercentage;
        UpdatedAt = DateTime.Now;
    }

    public void Finish()
    {
        IsFinished = true;
        FinishedAt = DateTime.Now;
        ProgressPercentage = 100m;
        UpdatedAt = DateTime.Now;
    }
}
