using DailyFitness.Domain.Common;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Domain.Entities;

public class UserChallenge : Entity
{
    public Guid UserId { get; set; }
    public Guid ChallengeId { get; set; }
    public EUserChallengeStatus UserChallengeStatus { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime? LeftAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? DiscontinuedAt { get; set; }
    public decimal CurrentProgress { get; set; }
    public decimal TargetProgress { get; set; }
    public DateTime? LastProgressUpdateAt { get; set; }

    public User? User { get; set; }
    public Challenge? Challenge { get; set; }
    public ICollection<UserChallengeProgress> Progresses { get; init; }

    public UserChallenge()
    {
        Progresses = new List<UserChallengeProgress>();
    }

    public UserChallenge(Guid userId, Guid challengeId) : base()
    {
        UserId = userId;
        ChallengeId = challengeId;
        UserChallengeStatus = EUserChallengeStatus.Active;
        JoinedAt = DateTime.Now;
        CurrentProgress = 0;
        TargetProgress = 0;
        Progresses = new List<UserChallengeProgress>();
    }

    public void Leave()
    {
        UserChallengeStatus = EUserChallengeStatus.Abandoned;
        LeftAt = DateTime.Now;
        UpdatedAt = DateTime.Now;
    }

    public void Discontinue()
    {
        UserChallengeStatus = EUserChallengeStatus.Discontinued;
        DiscontinuedAt = DateTime.Now;
        UpdatedAt = DateTime.Now;
    }

    public void UpdateProgress(decimal progressDelta)
    {
        CurrentProgress += progressDelta;
        LastProgressUpdateAt = DateTime.Now;
        UpdatedAt = DateTime.Now;
    }
}
