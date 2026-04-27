using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Dtos.Challenge;

public class UserChallengeDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserFullName { get; set; } = string.Empty;
    public string ChallengeId { get; set; } = string.Empty;
    public string ChallengeName { get; set; } = string.Empty;
    public EChallengeType ChallengeType { get; set; }
    public EChallengeStatus ChallengeStatus { get; set; }
    public DateTime ChallengeExpectedEndDate { get; set; }
    public EUserChallengeStatus UserChallengeStatus { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime? LeftAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? DiscontinuedAt { get; set; }
    public decimal CurrentProgress { get; set; }
    public decimal TargetProgress { get; set; }
    public DateTime? LastProgressUpdateAt { get; set; }
    public IEnumerable<UserChallengeProgressDto> Progresses { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public static UserChallengeDto FromEntity(UserChallenge userChallenge) => new()
    {
        Id = userChallenge.Id.ToString(),
        UserId = userChallenge.UserId.ToString(),
        UserFullName = userChallenge.User is not null ? $"{userChallenge.User.FirstName} {userChallenge.User.Surname}" : string.Empty,
        ChallengeId = userChallenge.ChallengeId.ToString(),
        ChallengeName = userChallenge.Challenge?.Name ?? string.Empty,
        ChallengeType = userChallenge.Challenge?.Type ?? default,
        ChallengeStatus = userChallenge.Challenge?.ChallengeStatus ?? default,
        ChallengeExpectedEndDate = userChallenge.Challenge?.ExpectedEndDate ?? default,
        UserChallengeStatus = userChallenge.UserChallengeStatus,
        JoinedAt = userChallenge.JoinedAt,
        LeftAt = userChallenge.LeftAt,
        CompletedAt = userChallenge.CompletedAt,
        DiscontinuedAt = userChallenge.DiscontinuedAt,
        CurrentProgress = userChallenge.CurrentProgress,
        TargetProgress = userChallenge.TargetProgress,
        LastProgressUpdateAt = userChallenge.LastProgressUpdateAt,
        Progresses = userChallenge.Progresses?.Select(UserChallengeProgressDto.FromEntity) ?? [],
        CreatedAt = userChallenge.CreatedAt,
        UpdatedAt = userChallenge.UpdatedAt
    };
}
