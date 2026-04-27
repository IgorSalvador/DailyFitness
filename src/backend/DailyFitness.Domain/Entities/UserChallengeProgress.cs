using DailyFitness.Domain.Common;

namespace DailyFitness.Domain.Entities;

public class UserChallengeProgress : Entity
{
    public Guid UserChallengeId { get; set; }
    public DateTime ReferenceDate { get; set; }
    public string ReferencePeriod { get; set; }
    public decimal ProgressValue { get; set; }
    public string? Notes { get; set; }

    public UserChallenge? UserChallenge { get; set; }

    public UserChallengeProgress()
    {
        ReferencePeriod = string.Empty;
    }

    public UserChallengeProgress(Guid userChallengeId, DateTime referenceDate, string referencePeriod, decimal progressValue, string? notes) : base()
    {
        UserChallengeId = userChallengeId;
        ReferenceDate = referenceDate;
        ReferencePeriod = referencePeriod;
        ProgressValue = progressValue;
        Notes = notes;
    }

    public void Update(decimal progressValue, string? notes)
    {
        ProgressValue = progressValue;
        Notes = notes;
        UpdatedAt = DateTime.Now;
    }
}
