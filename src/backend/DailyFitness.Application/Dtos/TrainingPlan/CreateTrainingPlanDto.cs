using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Dtos.TrainingPlan;

public class CreateTrainingPlanDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ETrainingObjective Objective { get; set; }
    public ETrainingLevel Level { get; set; }
    public string? Instructions { get; set; }
    public int MinimumDurationDays { get; set; }
    public List<CreateTrainingWorkoutDto> Workouts { get; set; } = [];
}

public class CreateTrainingWorkoutDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Instructions { get; set; }
    public int Order { get; set; }
    public List<CreateTrainingWorkoutItemDto> Items { get; set; } = [];
}

public class CreateTrainingWorkoutItemDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Instructions { get; set; }
    public int? Sets { get; set; }
    public int? Repetitions { get; set; }
    public int Order { get; set; }
}
