using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Dtos.TrainingPlan;

public class UpdateTrainingPlanDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ETrainingObjective Objective { get; set; }
    public ETrainingLevel Level { get; set; }
    public string? Instructions { get; set; }
    public int MinimumDurationDays { get; set; }
    public List<UpsertTrainingWorkoutDto> Workouts { get; set; } = [];
}

public class UpsertTrainingWorkoutDto
{
    public Guid? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Instructions { get; set; }
    public int Order { get; set; }
    public List<UpsertTrainingWorkoutItemDto> Items { get; set; } = [];
}

public class UpsertTrainingWorkoutItemDto
{
    public Guid? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Instructions { get; set; }
    public int? Sets { get; set; }
    public int? Repetitions { get; set; }
    public int Order { get; set; }
}
