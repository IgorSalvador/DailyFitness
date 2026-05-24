using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Domain.Entities;
using DailyFitness.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DailyFitness.Infrastructure.Repositories;

public class UserTrainingWorkoutDailyLogRepository(AppDbContext context) : Repository<UserTrainingWorkoutDailyLog>(context), IUserTrainingWorkoutDailyLogRepository
{
    public async Task<UserTrainingWorkoutDailyLog?> GetByPlanWorkoutAndDate(Guid userTrainingPlanId, Guid trainingWorkoutId, DateTime progressDate, CancellationToken ct)
    {
        var date = progressDate.Date;

        return await set
            .FirstOrDefaultAsync(x =>
                x.UserTrainingPlanId == userTrainingPlanId &&
                x.TrainingWorkoutId == trainingWorkoutId &&
                x.ProgressDate == date, ct);
    }

    public async Task<IEnumerable<UserTrainingWorkoutDailyLog>> GetByUserTrainingPlan(Guid userTrainingPlanId, CancellationToken ct)
    {
        return await set
            .Where(x => x.UserTrainingPlanId == userTrainingPlanId)
            .OrderByDescending(x => x.ProgressDate)
            .ToListAsync(ct);
    }
}
