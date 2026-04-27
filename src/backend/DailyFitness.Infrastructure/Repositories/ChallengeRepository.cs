using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Domain.Common;
using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;
using DailyFitness.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DailyFitness.Infrastructure.Repositories;

public class ChallengeRepository(AppDbContext context) : Repository<Challenge>(context), IChallengeRepository
{
    public async Task<Challenge?> GetWithParticipants(Guid id, CancellationToken ct)
    {
        return await set
            .Include(x => x.UserChallenges)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public async Task<IEnumerable<Challenge>> GetAllWithParticipants(CancellationToken ct)
    {
        return await set
            .Include(x => x.UserChallenges)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<Challenge>> GetAvailableForUser(Guid userId, CancellationToken ct)
    {
        var now = DateTime.Now;

        return await set
            .Include(x => x.UserChallenges)
            .Where(x =>
                x.Status == EntityStatus.Active &&
                x.ChallengeStatus == EChallengeStatus.Active &&
                x.ExpectedEndDate > now &&
                !x.UserChallenges.Any(uc =>
                    uc.UserId == userId &&
                    uc.UserChallengeStatus == EUserChallengeStatus.Active))
            .OrderBy(x => x.ExpectedEndDate)
            .ToListAsync(ct);
    }

    public async Task<bool> HasParticipants(Guid challengeId, CancellationToken ct)
    {
        return await set
            .AnyAsync(x => x.Id == challengeId && x.UserChallenges.Any(), ct);
    }
}
