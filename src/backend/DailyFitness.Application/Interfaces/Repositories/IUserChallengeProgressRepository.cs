using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Interfaces.Repositories;

public interface IUserChallengeProgressRepository : IRepository<UserChallengeProgress>
{
    Task<UserChallengeProgress?> GetByPeriod(Guid userChallengeId, string referencePeriod, CancellationToken ct);
    Task<IEnumerable<UserChallengeProgress>> GetByUserChallenge(Guid userChallengeId, CancellationToken ct);
}
