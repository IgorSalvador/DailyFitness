using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Dtos.TrainingPlan;

public class UserTrainingPlanDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserFullName { get; set; } = string.Empty;
    public string TrainingPlanId { get; set; } = string.Empty;
    public string TrainingPlanName { get; set; } = string.Empty;
    public EUserTrainingPlanStatus UserTrainingPlanStatus { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? CancellationReason { get; set; }
    public TrainingPlanDto? TrainingPlan { get; set; }
    public IEnumerable<UserTrainingProgressDto> Progresses { get; set; } = [];
    public IEnumerable<UserTrainingWorkoutDailyLogDto> DailyLogs { get; set; } = [];
    public decimal OverallProgressPercentage { get; set; }
    public int TotalItemsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public static UserTrainingPlanDto FromEntity(Domain.Entities.UserTrainingPlan utp) => new()
    {
        Id = utp.Id.ToString(),
        UserId = utp.UserId.ToString(),
        UserFullName = utp.User is not null ? $"{utp.User.FirstName} {utp.User.Surname}" : string.Empty,
        TrainingPlanId = utp.TrainingPlanId.ToString(),
        TrainingPlanName = utp.TrainingPlan?.Name ?? string.Empty,
        UserTrainingPlanStatus = utp.UserTrainingPlanStatus,
        StartedAt = utp.StartedAt,
        CancelledAt = utp.CancelledAt,
        CompletedAt = utp.CompletedAt,
        CancellationReason = utp.CancellationReason,
        TrainingPlan = utp.TrainingPlan is not null ? TrainingPlanDto.FromEntity(utp.TrainingPlan) : null,
        Progresses = utp.Progresses?.Select(UserTrainingProgressDto.FromEntity) ?? [],
        DailyLogs = utp.DailyLogs?.Select(UserTrainingWorkoutDailyLogDto.FromEntity) ?? [],
        OverallProgressPercentage = CalculateOverallProgress(utp),
        TotalItemsCompleted = utp.Progresses?.Count ?? 0,
        CreatedAt = utp.CreatedAt,
        UpdatedAt = utp.UpdatedAt
    };

    private static decimal CalculateOverallProgress(Domain.Entities.UserTrainingPlan utp)
    {
        if (utp.DailyLogs is null || !utp.DailyLogs.Any()) return 0m;

        // Progresso geral: média dos percentuais dos daily logs
        var avg = utp.DailyLogs.Average(x => x.ProgressPercentage);
        return Math.Round(avg, 2);
    }
}

public class UserTrainingProgressDto
{
    public string Id { get; set; } = string.Empty;
    public string UserTrainingPlanId { get; set; } = string.Empty;
    public string TrainingWorkoutId { get; set; } = string.Empty;
    public string TrainingWorkoutItemId { get; set; } = string.Empty;
    public DateTime ProgressDate { get; set; }
    public DateTime CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; }

    public static UserTrainingProgressDto FromEntity(Domain.Entities.UserTrainingProgress progress) => new()
    {
        Id = progress.Id.ToString(),
        UserTrainingPlanId = progress.UserTrainingPlanId.ToString(),
        TrainingWorkoutId = progress.TrainingWorkoutId.ToString(),
        TrainingWorkoutItemId = progress.TrainingWorkoutItemId.ToString(),
        ProgressDate = progress.ProgressDate,
        CompletedAt = progress.CompletedAt,
        CreatedAt = progress.CreatedAt
    };
}

public class UserTrainingWorkoutDailyLogDto
{
    public string Id { get; set; } = string.Empty;
    public string UserTrainingPlanId { get; set; } = string.Empty;
    public string TrainingWorkoutId { get; set; } = string.Empty;
    public DateTime ProgressDate { get; set; }
    public decimal ProgressPercentage { get; set; }
    public bool IsFinished { get; set; }
    public DateTime? FinishedAt { get; set; }
    public DateTime CreatedAt { get; set; }

    public static UserTrainingWorkoutDailyLogDto FromEntity(Domain.Entities.UserTrainingWorkoutDailyLog log) => new()
    {
        Id = log.Id.ToString(),
        UserTrainingPlanId = log.UserTrainingPlanId.ToString(),
        TrainingWorkoutId = log.TrainingWorkoutId.ToString(),
        ProgressDate = log.ProgressDate,
        ProgressPercentage = log.ProgressPercentage,
        IsFinished = log.IsFinished,
        FinishedAt = log.FinishedAt,
        CreatedAt = log.CreatedAt
    };
}

public class TrainingPlanSubscriberDto
{
    public string UserTrainingPlanId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserFullName { get; set; } = string.Empty;
    public EUserTrainingPlanStatus Status { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public decimal OverallProgressPercentage { get; set; }
    public IEnumerable<UserTrainingWorkoutDailyLogDto> DailyLogs { get; set; } = [];

    public static TrainingPlanSubscriberDto FromEntity(Domain.Entities.UserTrainingPlan utp) => new()
    {
        UserTrainingPlanId = utp.Id.ToString(),
        UserId = utp.UserId.ToString(),
        UserFullName = utp.User is not null ? $"{utp.User.FirstName} {utp.User.Surname}" : string.Empty,
        Status = utp.UserTrainingPlanStatus,
        StartedAt = utp.StartedAt,
        CancelledAt = utp.CancelledAt,
        CompletedAt = utp.CompletedAt,
        OverallProgressPercentage = utp.DailyLogs?.Any() == true
            ? Math.Round(utp.DailyLogs.Average(x => x.ProgressPercentage), 2)
            : 0m,
        DailyLogs = utp.DailyLogs?.Select(UserTrainingWorkoutDailyLogDto.FromEntity) ?? []
    };
}
