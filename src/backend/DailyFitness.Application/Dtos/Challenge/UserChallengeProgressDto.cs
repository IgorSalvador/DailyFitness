using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Dtos.Challenge;

public class UserChallengeProgressDto
{
    public string Id { get; set; } = string.Empty;
    public string UserChallengeId { get; set; } = string.Empty;
    public DateTime ReferenceDate { get; set; }
    public string ReferencePeriod { get; set; } = string.Empty;
    public decimal ProgressValue { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public static UserChallengeProgressDto FromEntity(UserChallengeProgress progress) => new()
    {
        Id = progress.Id.ToString(),
        UserChallengeId = progress.UserChallengeId.ToString(),
        ReferenceDate = progress.ReferenceDate,
        ReferencePeriod = progress.ReferencePeriod,
        ProgressValue = progress.ProgressValue,
        Notes = progress.Notes,
        CreatedAt = progress.CreatedAt,
        UpdatedAt = progress.UpdatedAt
    };
}
