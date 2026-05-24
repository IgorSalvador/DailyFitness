using DailyFitness.Domain.Common;

namespace DailyFitness.Domain.Entities;

public class TrainingWorkout : Entity
{
    public Guid TrainingPlanId { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public string? Instructions { get; private set; }
    public int Order { get; private set; }

    public TrainingPlan? TrainingPlan { get; set; }
    public ICollection<TrainingWorkoutItem> Items { get; init; }

    public TrainingWorkout()
    {
        Name = string.Empty;
        Items = new List<TrainingWorkoutItem>();
    }

    public TrainingWorkout(
        Guid trainingPlanId,
        string name,
        int order,
        string? description = null,
        string? instructions = null) : base()
    {
        TrainingPlanId = trainingPlanId;
        Name = name;
        Order = order;
        Description = description;
        Instructions = instructions;
        Items = new List<TrainingWorkoutItem>();
    }

    public void Update(string name, int order, string? description, string? instructions)
    {
        Name = name;
        Order = order;
        Description = description;
        Instructions = instructions;
        UpdatedAt = DateTime.Now;
    }
}
