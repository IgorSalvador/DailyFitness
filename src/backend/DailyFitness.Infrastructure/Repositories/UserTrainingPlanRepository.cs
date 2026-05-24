using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;
using DailyFitness.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DailyFitness.Infrastructure.Repositories;

public class UserTrainingPlanRepository(AppDbContext context) : Repository<UserTrainingPlan>(context), IUserTrainingPlanRepository
{
    public async Task<UserTrainingPlan?> GetActiveByUser(Guid userId, CancellationToken ct)
    {
        return await set
            .Include(x => x.TrainingPlan)
                .ThenInclude(p => p!.Workouts.OrderBy(w => w.Order))
                    .ThenInclude(w => w.Items.OrderBy(i => i.Order))
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.UserTrainingPlanStatus == EUserTrainingPlanStatus.Active, ct);
    }

    public async Task<UserTrainingPlan?> GetWithPlanAndProgress(Guid userTrainingPlanId, CancellationToken ct)
    {
        return await set
            .Include(x => x.TrainingPlan)
                .ThenInclude(p => p!.Workouts.OrderBy(w => w.Order))
                    .ThenInclude(w => w.Items.OrderBy(i => i.Order))
            .Include(x => x.Progresses)
            .Include(x => x.DailyLogs)
            .FirstOrDefaultAsync(x => x.Id == userTrainingPlanId, ct);
    }

    public async Task<IEnumerable<UserTrainingPlan>> GetByUser(Guid userId, CancellationToken ct)
    {
        return await set
            .Include(x => x.TrainingPlan)
            .Include(x => x.Progresses)
            .Include(x => x.DailyLogs)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.StartedAt)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<UserTrainingPlan>> GetByPlan(Guid trainingPlanId, CancellationToken ct)
    {
        return await set
            .Include(x => x.User)
            .Include(x => x.Progresses)
            .Where(x => x.TrainingPlanId == trainingPlanId)
            .OrderByDescending(x => x.StartedAt)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<UserTrainingPlan>> GetByPlanWithUser(Guid trainingPlanId, CancellationToken ct)
    {
        return await set
            .Include(x => x.User)
            .Include(x => x.DailyLogs)
            .Where(x => x.TrainingPlanId == trainingPlanId)
            .OrderByDescending(x => x.StartedAt)
            .ToListAsync(ct);
    }
}
