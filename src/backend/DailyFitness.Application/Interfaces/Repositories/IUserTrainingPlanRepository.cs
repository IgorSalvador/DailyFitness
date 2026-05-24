using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Interfaces.Repositories;

public interface IUserTrainingPlanRepository : IRepository<UserTrainingPlan>
{
    Task<UserTrainingPlan?> GetActiveByUser(Guid userId, CancellationToken ct);
    Task<UserTrainingPlan?> GetWithPlanAndProgress(Guid userTrainingPlanId, CancellationToken ct);
    Task<IEnumerable<UserTrainingPlan>> GetByUser(Guid userId, CancellationToken ct);
    Task<IEnumerable<UserTrainingPlan>> GetByPlan(Guid trainingPlanId, CancellationToken ct);
    Task<IEnumerable<UserTrainingPlan>> GetByPlanWithUser(Guid trainingPlanId, CancellationToken ct);
}
