using DailyFitness.Domain.Common;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Domain.Entities;

public class TrainingPlan : Entity
{
    public string Name { get; private set; }
    public string Description { get; private set; }
    public ETrainingObjective Objective { get; private set; }
    public ETrainingLevel Level { get; private set; }
    public string? Instructions { get; private set; }
    public int MinimumDurationDays { get; private set; }
    public Guid? CreatedByUserId { get; private set; }

    public User? CreatedByUser { get; set; }
    public ICollection<TrainingWorkout> Workouts { get; init; }
    public ICollection<UserTrainingPlan> UserTrainingPlans { get; init; }

    public TrainingPlan()
    {
        Name = string.Empty;
        Description = string.Empty;
        Workouts = new List<TrainingWorkout>();
        UserTrainingPlans = new List<UserTrainingPlan>();
    }

    public TrainingPlan(
        string name,
        string description,
        ETrainingObjective objective,
        ETrainingLevel level,
        int minimumDurationDays,
        string? instructions = null,
        Guid? createdByUserId = null) : base()
    {
        Name = name;
        Description = description;
        Objective = objective;
        Level = level;
        MinimumDurationDays = minimumDurationDays;
        Instructions = instructions;
        CreatedByUserId = createdByUserId;
        Workouts = new List<TrainingWorkout>();
        UserTrainingPlans = new List<UserTrainingPlan>();
    }

    public void Update(
        string name,
        string description,
        ETrainingObjective objective,
        ETrainingLevel level,
        int minimumDurationDays,
        string? instructions)
    {
        Name = name;
        Description = description;
        Objective = objective;
        Level = level;
        MinimumDurationDays = minimumDurationDays;
        Instructions = instructions;
        UpdatedAt = DateTime.Now;
    }

    public bool IsAvailableForSubscription() =>
        Status == EntityStatus.Active;
}
