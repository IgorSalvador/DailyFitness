using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;
using DailyFitness.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DailyFitness.Infrastructure.Repositories;

public class UserChallengeRepository(AppDbContext context) : Repository<UserChallenge>(context), IUserChallengeRepository
{
    public async Task<UserChallenge?> GetActiveByUserAndChallenge(Guid userId, Guid challengeId, CancellationToken ct)
    {
        return await set
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.ChallengeId == challengeId &&
                x.UserChallengeStatus == EUserChallengeStatus.Active, ct);
    }

    public async Task<UserChallenge?> GetWithChallenge(Guid id, CancellationToken ct)
    {
        return await set
            .Include(x => x.Challenge)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public async Task<UserChallenge?> GetWithChallengeAndProgresses(Guid id, CancellationToken ct)
    {
        return await set
            .Include(x => x.Challenge)
            .Include(x => x.Progresses.OrderByDescending(p => p.ReferenceDate))
            .FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public async Task<IEnumerable<UserChallenge>> GetActiveByChallenge(Guid challengeId, CancellationToken ct)
    {
        return await set
            .Include(x => x.User)
            .Where(x => x.ChallengeId == challengeId && x.UserChallengeStatus == EUserChallengeStatus.Active)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<UserChallenge>> GetByUserWithChallenge(Guid userId, CancellationToken ct)
    {
        return await set
            .Include(x => x.Challenge)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.JoinedAt)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<UserChallenge>> GetByChallengeWithUser(Guid challengeId, CancellationToken ct)
    {
        return await set
            .Include(x => x.User)
            .Where(x => x.ChallengeId == challengeId)
            .OrderByDescending(x => x.JoinedAt)
            .ToListAsync(ct);
    }
}
