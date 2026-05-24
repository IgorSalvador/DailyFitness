using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Domain.Entities;
using DailyFitness.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DailyFitness.Infrastructure.Repositories;

public class UserDietProgressRepository(AppDbContext context) : Repository<UserDietProgress>(context), IUserDietProgressRepository
{
    public async Task<UserDietProgress?> GetByKeyAsync(Guid userDietPlanId, Guid dietMealItemId, DateOnly date, CancellationToken ct)
    {
        return await set
            .FirstOrDefaultAsync(x =>
                x.UserDietPlanId == userDietPlanId &&
                x.DietMealItemId == dietMealItemId &&
                x.ProgressDate == date, ct);
    }

    public async Task<IEnumerable<UserDietProgress>> GetByPlanAsync(Guid userDietPlanId, CancellationToken ct)
    {
        return await set
            .Where(x => x.UserDietPlanId == userDietPlanId)
            .OrderByDescending(x => x.ProgressDate)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<UserDietProgress>> GetByPlanAndDateAsync(Guid userDietPlanId, DateOnly date, CancellationToken ct)
    {
        return await set
            .Where(x => x.UserDietPlanId == userDietPlanId && x.ProgressDate == date)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<UserDietProgress>> GetByMealAndDateAsync(Guid userDietPlanId, Guid dietMealId, DateOnly date, CancellationToken ct)
    {
        return await set
            .Where(x =>
                x.UserDietPlanId == userDietPlanId &&
                x.DietMealId == dietMealId &&
                x.ProgressDate == date)
            .ToListAsync(ct);
    }
}
