using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Interfaces.Repositories;

public interface IUserTrainingProgressRepository : IRepository<UserTrainingProgress>
{
    Task<UserTrainingProgress?> GetByPlanItemAndDate(Guid userTrainingPlanId, Guid trainingWorkoutItemId, DateTime progressDate, CancellationToken ct);
    Task<IEnumerable<UserTrainingProgress>> GetByPlanAndWorkoutAndDate(Guid userTrainingPlanId, Guid trainingWorkoutId, DateTime progressDate, CancellationToken ct);
    Task<IEnumerable<UserTrainingProgress>> GetByUserTrainingPlan(Guid userTrainingPlanId, CancellationToken ct);
}
