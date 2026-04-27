using DailyFitness.Domain.Common;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Domain.Entities;

public class Challenge : Entity
{
    public string Name { get; private set; }
    public string Description { get; private set; }
    public EChallengeType Type { get; private set; }
    public EChallengeStatus ChallengeStatus { get; private set; }
    public DateTime ExpectedEndDate { get; private set; }

    public ICollection<UserChallenge> UserChallenges { get; init; }

    public Challenge()
    {
        Name = string.Empty;
        Description = string.Empty;
        UserChallenges = new List<UserChallenge>();
    }

    public Challenge(string name, string description, EChallengeType type, DateTime expectedEndDate)
    {
        Name = name;
        Description = description;
        Type = type;
        ExpectedEndDate = expectedEndDate;
        ChallengeStatus = EChallengeStatus.Active;
        UserChallenges = new List<UserChallenge>();
    }

    public void Update(string name, string description, DateTime expectedEndDate, EChallengeType? type = null, EChallengeStatus? challengeStatus = null)
    {
        Name = name;
        Description = description;
        ExpectedEndDate = expectedEndDate;

        if (type.HasValue)
            Type = type.Value;

        if (challengeStatus.HasValue)
            ChallengeStatus = challengeStatus.Value;

        UpdatedAt = DateTime.Now;
    }

    public void Discontinue()
    {
        ChallengeStatus = EChallengeStatus.Discontinued;
        SetAsInactive();
    }

    public bool IsExpired() => ExpectedEndDate < DateTime.Now;

    public bool IsAvailableForParticipation() =>
        Status == EntityStatus.Active &&
        ChallengeStatus == EChallengeStatus.Active &&
        !IsExpired();
}
