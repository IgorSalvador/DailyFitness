using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Interfaces.Repositories;

public interface IUserChallengeRepository : IRepository<UserChallenge>
{
    Task<UserChallenge?> GetActiveByUserAndChallenge(Guid userId, Guid challengeId, CancellationToken ct);
    Task<UserChallenge?> GetWithChallenge(Guid id, CancellationToken ct);
    Task<UserChallenge?> GetWithChallengeAndProgresses(Guid id, CancellationToken ct);
    Task<IEnumerable<UserChallenge>> GetActiveByChallenge(Guid challengeId, CancellationToken ct);
    Task<IEnumerable<UserChallenge>> GetByUserWithChallenge(Guid userId, CancellationToken ct);
    Task<IEnumerable<UserChallenge>> GetByChallengeWithUser(Guid challengeId, CancellationToken ct);
}
