using DailyFitness.Domain.Common;

namespace DailyFitness.Domain.Entities;

public class UserTrainingProgress : Entity
{
    public Guid UserTrainingPlanId { get; private set; }
    public Guid TrainingWorkoutId { get; private set; }
    public Guid TrainingWorkoutItemId { get; private set; }
    public DateTime ProgressDate { get; private set; }
    public DateTime CompletedAt { get; private set; }

    public UserTrainingPlan? UserTrainingPlan { get; set; }
    public TrainingWorkout? TrainingWorkout { get; set; }
    public TrainingWorkoutItem? TrainingWorkoutItem { get; set; }

    public UserTrainingProgress()
    {
    }

    public UserTrainingProgress(
        Guid userTrainingPlanId,
        Guid trainingWorkoutId,
        Guid trainingWorkoutItemId,
        DateTime progressDate) : base()
    {
        UserTrainingPlanId = userTrainingPlanId;
        TrainingWorkoutId = trainingWorkoutId;
        TrainingWorkoutItemId = trainingWorkoutItemId;
        ProgressDate = progressDate;
        CompletedAt = DateTime.Now;
    }
}
