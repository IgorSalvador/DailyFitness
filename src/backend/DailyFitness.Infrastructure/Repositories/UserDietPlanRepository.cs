using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;
using DailyFitness.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DailyFitness.Infrastructure.Repositories;

public class UserDietPlanRepository(AppDbContext context) : Repository<UserDietPlan>(context), IUserDietPlanRepository
{
    public async Task<UserDietPlan?> GetActiveByUserIdAsync(Guid userId, CancellationToken ct)
    {
        return await set
            .Include(x => x.DietPlan)
                .ThenInclude(p => p!.Meals.OrderBy(m => m.Order))
                    .ThenInclude(m => m.Items.OrderBy(i => i.Order))
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.UserDietPlanStatus == EUserDietPlanStatus.Active, ct);
    }

    public async Task<UserDietPlan?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct)
    {
        return await set
            .Include(x => x.DietPlan)
                .ThenInclude(p => p!.Meals.OrderBy(m => m.Order))
                    .ThenInclude(m => m.Items.OrderBy(i => i.Order))
            .Include(x => x.Progresses)
            .Include(x => x.DailyLogs)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public async Task<UserDietPlan?> GetByUserAndPlanIdAsync(Guid userId, Guid planId, CancellationToken ct)
    {
        return await set
            .FirstOrDefaultAsync(x => x.UserId == userId && x.DietPlanId == planId, ct);
    }

    public async Task<IEnumerable<UserDietPlan>> GetHistoryByUserIdAsync(Guid userId, CancellationToken ct)
    {
        return await set
            .Include(x => x.DietPlan)
            .Include(x => x.DailyLogs)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.StartedAt)
            .ToListAsync(ct);
    }

    public async Task<UserDietPlan?> GetSubscriberProgressAsync(Guid planId, Guid userId, CancellationToken ct)
    {
        return await set
            .Include(x => x.DietPlan)
                .ThenInclude(p => p!.Meals.OrderBy(m => m.Order))
                    .ThenInclude(m => m.Items.OrderBy(i => i.Order))
            .Include(x => x.Progresses)
            .Include(x => x.DailyLogs)
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.DietPlanId == planId && x.UserId == userId, ct);
    }
}
