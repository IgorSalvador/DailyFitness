using DailyFitness.Domain.Common;

namespace DailyFitness.Domain.Entities;

public class TrainingWorkoutItem : Entity
{
    public Guid TrainingWorkoutId { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public string? Instructions { get; private set; }
    public int? Sets { get; private set; }
    public int? Repetitions { get; private set; }
    public int Order { get; private set; }

    public TrainingWorkout? TrainingWorkout { get; set; }

    public TrainingWorkoutItem()
    {
        Name = string.Empty;
    }

    public TrainingWorkoutItem(
        Guid trainingWorkoutId,
        string name,
        int order,
        string? description = null,
        string? instructions = null,
        int? sets = null,
        int? repetitions = null) : base()
    {
        TrainingWorkoutId = trainingWorkoutId;
        Name = name;
        Order = order;
        Description = description;
        Instructions = instructions;
        Sets = sets;
        Repetitions = repetitions;
    }

    public void Update(string name, int order, string? description, string? instructions, int? sets, int? repetitions)
    {
        Name = name;
        Order = order;
        Description = description;
        Instructions = instructions;
        Sets = sets;
        Repetitions = repetitions;
        UpdatedAt = DateTime.Now;
    }
}
