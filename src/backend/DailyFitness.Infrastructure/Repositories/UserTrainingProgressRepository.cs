using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Domain.Entities;
using DailyFitness.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DailyFitness.Infrastructure.Repositories;

public class UserTrainingProgressRepository(AppDbContext context) : Repository<UserTrainingProgress>(context), IUserTrainingProgressRepository
{
    public async Task<UserTrainingProgress?> GetByPlanItemAndDate(Guid userTrainingPlanId, Guid trainingWorkoutItemId, DateTime progressDate, CancellationToken ct)
    {
        var date = progressDate.Date;

        return await set
            .FirstOrDefaultAsync(x =>
                x.UserTrainingPlanId == userTrainingPlanId &&
                x.TrainingWorkoutItemId == trainingWorkoutItemId &&
                x.ProgressDate == date, ct);
    }

    public async Task<IEnumerable<UserTrainingProgress>> GetByPlanAndWorkoutAndDate(Guid userTrainingPlanId, Guid trainingWorkoutId, DateTime progressDate, CancellationToken ct)
    {
        var date = progressDate.Date;

        return await set
            .Where(x =>
                x.UserTrainingPlanId == userTrainingPlanId &&
                x.TrainingWorkoutId == trainingWorkoutId &&
                x.ProgressDate == date)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<UserTrainingProgress>> GetByUserTrainingPlan(Guid userTrainingPlanId, CancellationToken ct)
    {
        return await set
            .Where(x => x.UserTrainingPlanId == userTrainingPlanId)
            .OrderByDescending(x => x.ProgressDate)
            .ToListAsync(ct);
    }
}
