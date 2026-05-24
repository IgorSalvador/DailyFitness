using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Interfaces.Repositories;

public interface IUserTrainingWorkoutDailyLogRepository : IRepository<UserTrainingWorkoutDailyLog>
{
    Task<UserTrainingWorkoutDailyLog?> GetByPlanWorkoutAndDate(Guid userTrainingPlanId, Guid trainingWorkoutId, DateTime progressDate, CancellationToken ct);
    Task<IEnumerable<UserTrainingWorkoutDailyLog>> GetByUserTrainingPlan(Guid userTrainingPlanId, CancellationToken ct);
}
