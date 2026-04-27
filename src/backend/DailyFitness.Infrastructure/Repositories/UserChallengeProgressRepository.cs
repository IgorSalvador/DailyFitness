using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Domain.Entities;
using DailyFitness.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DailyFitness.Infrastructure.Repositories;

public class UserChallengeProgressRepository(AppDbContext context) : Repository<UserChallengeProgress>(context), IUserChallengeProgressRepository
{
    public async Task<UserChallengeProgress?> GetByPeriod(Guid userChallengeId, string referencePeriod, CancellationToken ct)
    {
        return await set
            .FirstOrDefaultAsync(x =>
                x.UserChallengeId == userChallengeId &&
                x.ReferencePeriod == referencePeriod, ct);
    }

    public async Task<IEnumerable<UserChallengeProgress>> GetByUserChallenge(Guid userChallengeId, CancellationToken ct)
    {
        return await set
            .Where(x => x.UserChallengeId == userChallengeId)
            .OrderByDescending(x => x.ReferenceDate)
            .ToListAsync(ct);
    }
}
