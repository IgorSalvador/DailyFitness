using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Domain.Common;
using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;
using DailyFitness.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DailyFitness.Infrastructure.Repositories;

public class DietPlanRepository(AppDbContext context) : Repository<DietPlan>(context), IDietPlanRepository
{
    public async Task<IEnumerable<DietPlan>> GetAllWithMealsAsync(CancellationToken ct)
    {
        return await set
            .Include(x => x.Meals.OrderBy(m => m.Order))
                .ThenInclude(m => m.Items.OrderBy(i => i.Order))
            .Include(x => x.UserDietPlans)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<DietPlan?> GetByIdWithMealsAsync(Guid id, CancellationToken ct)
    {
        return await set
            .Include(x => x.Meals.OrderBy(m => m.Order))
                .ThenInclude(m => m.Items.OrderBy(i => i.Order))
            .Include(x => x.UserDietPlans)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public async Task<IEnumerable<DietPlan>> GetAvailablePlansAsync(EDietObjective? objective, EDietLevel? level, CancellationToken ct)
    {
        var query = set
            .Include(x => x.Meals.Where(m => m.Status == EntityStatus.Active).OrderBy(m => m.Order))
                .ThenInclude(m => m.Items.Where(i => i.Status == EntityStatus.Active).OrderBy(i => i.Order))
            .Where(x => x.Status == EntityStatus.Active);

        if (objective.HasValue)
            query = query.Where(x => x.Objective == objective.Value);

        if (level.HasValue)
            query = query.Where(x => x.Level == level.Value);

        return await query
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<DietPlan>> GetByCreatorAsync(Guid creatorId, CancellationToken ct)
    {
        return await set
            .Include(x => x.Meals.OrderBy(m => m.Order))
                .ThenInclude(m => m.Items.OrderBy(i => i.Order))
            .Include(x => x.UserDietPlans)
            .Where(x => x.CreatedByUserId == creatorId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<DietPlan?> GetByCreatorAndIdAsync(Guid id, Guid creatorId, CancellationToken ct)
    {
        return await set
            .Include(x => x.Meals.OrderBy(m => m.Order))
                .ThenInclude(m => m.Items.OrderBy(i => i.Order))
            .Include(x => x.UserDietPlans)
            .FirstOrDefaultAsync(x => x.Id == id && x.CreatedByUserId == creatorId, ct);
    }

    public async Task<IEnumerable<UserDietPlan>> GetSubscribersAsync(Guid planId, CancellationToken ct)
    {
        return await context.UserDietPlans
            .Include(x => x.User)
            .Include(x => x.DailyLogs)
            .Where(x => x.DietPlanId == planId)
            .OrderByDescending(x => x.StartedAt)
            .ToListAsync(ct);
    }
}
