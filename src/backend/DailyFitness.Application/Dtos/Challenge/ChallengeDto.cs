using DailyFitness.Domain.Common;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Dtos.Challenge;

public class ChallengeDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public EChallengeType Type { get; set; }
    public EChallengeStatus ChallengeStatus { get; set; }
    public EntityStatus Status { get; set; }
    public DateTime ExpectedEndDate { get; set; }
    public bool IsExpired { get; set; }
    public int ParticipantCount { get; set; }
    public int ActiveParticipantCount { get; set; }
    public string? CreatedById { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public static ChallengeDto FromEntity(Domain.Entities.Challenge challenge) => new()
    {
        Id = challenge.Id.ToString(),
        Name = challenge.Name,
        Description = challenge.Description,
        Type = challenge.Type,
        ChallengeStatus = challenge.ChallengeStatus,
        Status = challenge.Status,
        ExpectedEndDate = challenge.ExpectedEndDate,
        IsExpired = challenge.IsExpired(),
        ParticipantCount = challenge.UserChallenges?.Count ?? 0,
        ActiveParticipantCount = challenge.UserChallenges?.Count(x => x.UserChallengeStatus == EUserChallengeStatus.Active) ?? 0,
        CreatedById = challenge.CreatedBy?.ToString(),
        CreatedAt = challenge.CreatedAt,
        UpdatedAt = challenge.UpdatedAt
    };
}
