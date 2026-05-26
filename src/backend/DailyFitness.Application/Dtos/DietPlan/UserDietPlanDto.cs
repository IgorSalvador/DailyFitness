using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Dtos.DietPlan;

public class UserDietPlanDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid DietPlanId { get; set; }
    public EUserDietPlanStatus UserDietPlanStatus { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? CancellationReason { get; set; }
    public decimal OverallProgress { get; set; }
    public DietPlanDto? DietPlan { get; set; }
    public IEnumerable<UserDietMealDailyLogDto> DailyLogs { get; set; } = [];
    public IEnumerable<UserDietProgressDto> Progresses { get; set; } = [];

    public static UserDietPlanDto FromEntity(UserDietPlan entity, bool includeDetails = false)
    {
        return new UserDietPlanDto
        {
            Id = entity.Id,
            UserId = entity.UserId,
            DietPlanId = entity.DietPlanId,
            UserDietPlanStatus = entity.UserDietPlanStatus,
            StartedAt = entity.StartedAt,
            CancelledAt = entity.CancelledAt,
            CompletedAt = entity.CompletedAt,
            CancellationReason = entity.CancellationReason,
            OverallProgress = CalculateOverallProgress(entity),
            DietPlan = entity.DietPlan != null ? DietPlanDto.FromEntity(entity.DietPlan, includeDetails) : null,
            DailyLogs = includeDetails && entity.DailyLogs != null
                ? entity.DailyLogs.OrderByDescending(l => l.LogDate).Select(UserDietMealDailyLogDto.FromEntity)
                : [],
            Progresses = includeDetails && entity.Progresses != null
                ? entity.Progresses.Select(UserDietProgressDto.FromEntity)
                : [],
        };
    }

    private static decimal CalculateOverallProgress(UserDietPlan entity)
    {
        if (entity.DailyLogs == null || !entity.DailyLogs.Any()) return 0;
        var avg = entity.DailyLogs.Average(l => (double)l.CompletionPercentage);
        return Math.Round((decimal)avg, 2);
    }
}

public class UserDietProgressDto
{
    public Guid Id { get; set; }
    public Guid DietMealItemId { get; set; }
    public DateOnly ProgressDate { get; set; }
    public bool IsCompleted { get; set; }

    public static UserDietProgressDto FromEntity(UserDietProgress entity)
    {
        return new UserDietProgressDto
        {
            Id = entity.Id,
            DietMealItemId = entity.DietMealItemId,
            ProgressDate = entity.ProgressDate,
            IsCompleted = entity.IsCompleted,
        };
    }
}

public class UserDietMealDailyLogDto
{
    public Guid Id { get; set; }
    public Guid DietMealId { get; set; }
    public DateOnly LogDate { get; set; }
    public int TotalItems { get; set; }
    public int CompletedItems { get; set; }
    public decimal CompletionPercentage { get; set; }

    public static UserDietMealDailyLogDto FromEntity(UserDietMealDailyLog entity)
    {
        return new UserDietMealDailyLogDto
        {
            Id = entity.Id,
            DietMealId = entity.DietMealId,
            LogDate = entity.LogDate,
            TotalItems = entity.TotalItems,
            CompletedItems = entity.CompletedItems,
            CompletionPercentage = entity.CompletionPercentage,
        };
    }
}

public class DietPlanSubscriberDto
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public EUserDietPlanStatus Status { get; set; }
    public DateTime StartedAt { get; set; }
    public decimal OverallProgress { get; set; }

    public static DietPlanSubscriberDto FromEntity(UserDietPlan entity)
    {
        return new DietPlanSubscriberDto
        {
            UserId = entity.UserId,
            UserName = $"{entity.User?.FirstName ?? string.Empty} {entity.User?.Surname ?? string.Empty}".Trim(),
            UserEmail = entity.User?.Email ?? string.Empty,
            Status = entity.UserDietPlanStatus,
            StartedAt = entity.StartedAt,
            OverallProgress = entity.DailyLogs?.Any() == true
                ? Math.Round((decimal)entity.DailyLogs.Average(l => (double)l.CompletionPercentage), 2)
                : 0,
        };
    }
}
