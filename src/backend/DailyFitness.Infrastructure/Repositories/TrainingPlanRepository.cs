using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Domain.Common;
using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;
using DailyFitness.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DailyFitness.Infrastructure.Repositories;

public class TrainingPlanRepository(AppDbContext context) : Repository<TrainingPlan>(context), ITrainingPlanRepository
{
    public async Task<TrainingPlan?> GetWithWorkoutsAndItems(Guid id, CancellationToken ct)
    {
        return await set
            .Include(x => x.Workouts.Where(w => w.Status == EntityStatus.Active).OrderBy(w => w.Order))
                .ThenInclude(w => w.Items.Where(i => i.Status == EntityStatus.Active).OrderBy(i => i.Order))
            .FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public async Task<IEnumerable<TrainingPlan>> GetAllWithWorkouts(CancellationToken ct)
    {
        return await set
            .Include(x => x.Workouts.OrderBy(w => w.Order))
                .ThenInclude(w => w.Items.OrderBy(i => i.Order))
            .Include(x => x.UserTrainingPlans)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<TrainingPlan>> GetActive(ETrainingObjective? objective, ETrainingLevel? level, CancellationToken ct)
    {
        var query = set
            .Include(x => x.Workouts.Where(w => w.Status == EntityStatus.Active).OrderBy(w => w.Order))
                .ThenInclude(w => w.Items.Where(i => i.Status == EntityStatus.Active).OrderBy(i => i.Order))
            .Where(x => x.Status == EntityStatus.Active);

        if (objective.HasValue)
            query = query.Where(x => x.Objective == objective.Value);

        if (level.HasValue)
            query = query.Where(x => x.Level == level.Value);

        return await query
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<TrainingPlan>> GetByCreator(Guid creatorId, CancellationToken ct)
    {
        return await set
            .Include(x => x.Workouts.OrderBy(w => w.Order))
                .ThenInclude(w => w.Items.OrderBy(i => i.Order))
            .Include(x => x.UserTrainingPlans)
            .Where(x => x.CreatedByUserId == creatorId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<TrainingPlan?> GetWithWorkoutsAndItemsByCreator(Guid id, Guid creatorId, CancellationToken ct)
    {
        return await set
            .Include(x => x.Workouts.OrderBy(w => w.Order))
                .ThenInclude(w => w.Items.OrderBy(i => i.Order))
            .Include(x => x.UserTrainingPlans)
            .FirstOrDefaultAsync(x => x.Id == id && x.CreatedByUserId == creatorId, ct);
    }
}
