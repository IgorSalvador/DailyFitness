using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Domain.Entities;
using DailyFitness.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DailyFitness.Infrastructure.Repositories;

public class UserDietMealDailyLogRepository(AppDbContext context) : Repository<UserDietMealDailyLog>(context), IUserDietMealDailyLogRepository
{
    public async Task<UserDietMealDailyLog?> GetByKeyAsync(Guid userDietPlanId, Guid dietMealId, DateOnly date, CancellationToken ct)
    {
        return await set
            .FirstOrDefaultAsync(x =>
                x.UserDietPlanId == userDietPlanId &&
                x.DietMealId == dietMealId &&
                x.LogDate == date, ct);
    }

    public async Task<IEnumerable<UserDietMealDailyLog>> GetByPlanAndDateAsync(Guid userDietPlanId, DateOnly date, CancellationToken ct)
    {
        return await set
            .Where(x => x.UserDietPlanId == userDietPlanId && x.LogDate == date)
            .ToListAsync(ct);
    }
}
