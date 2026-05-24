using DailyFitness.Domain.Common;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Dtos.TrainingPlan;

public class TrainingPlanDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ETrainingObjective Objective { get; set; }
    public ETrainingLevel Level { get; set; }
    public string? Instructions { get; set; }
    public int MinimumDurationDays { get; set; }
    public EntityStatus Status { get; set; }
    public string? CreatedByUserId { get; set; }
    public int SubscriberCount { get; set; }
    public int ActiveSubscriberCount { get; set; }
    public IEnumerable<TrainingWorkoutDto> Workouts { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public static TrainingPlanDto FromEntity(Domain.Entities.TrainingPlan plan) => new()
    {
        Id = plan.Id.ToString(),
        Name = plan.Name,
        Description = plan.Description,
        Objective = plan.Objective,
        Level = plan.Level,
        Instructions = plan.Instructions,
        MinimumDurationDays = plan.MinimumDurationDays,
        Status = plan.Status,
        CreatedByUserId = plan.CreatedByUserId?.ToString(),
        SubscriberCount = plan.UserTrainingPlans?.Count ?? 0,
        ActiveSubscriberCount = plan.UserTrainingPlans?.Count(x => x.UserTrainingPlanStatus == EUserTrainingPlanStatus.Active) ?? 0,
        Workouts = plan.Workouts?.Select(TrainingWorkoutDto.FromEntity) ?? [],
        CreatedAt = plan.CreatedAt,
        UpdatedAt = plan.UpdatedAt
    };
}

public class TrainingWorkoutDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Instructions { get; set; }
    public int Order { get; set; }
    public EntityStatus Status { get; set; }
    public IEnumerable<TrainingWorkoutItemDto> Items { get; set; } = [];

    public static TrainingWorkoutDto FromEntity(Domain.Entities.TrainingWorkout workout) => new()
    {
        Id = workout.Id.ToString(),
        Name = workout.Name,
        Description = workout.Description,
        Instructions = workout.Instructions,
        Order = workout.Order,
        Status = workout.Status,
        Items = workout.Items?.Select(TrainingWorkoutItemDto.FromEntity) ?? []
    };
}

public class TrainingWorkoutItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Instructions { get; set; }
    public int? Sets { get; set; }
    public int? Repetitions { get; set; }
    public int Order { get; set; }
    public EntityStatus Status { get; set; }

    public static TrainingWorkoutItemDto FromEntity(Domain.Entities.TrainingWorkoutItem item) => new()
    {
        Id = item.Id.ToString(),
        Name = item.Name,
        Description = item.Description,
        Instructions = item.Instructions,
        Sets = item.Sets,
        Repetitions = item.Repetitions,
        Order = item.Order,
        Status = item.Status
    };
}
