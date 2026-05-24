using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Interfaces.Repositories;

public interface ITrainingPlanRepository : IRepository<TrainingPlan>
{
    Task<TrainingPlan?> GetWithWorkoutsAndItems(Guid id, CancellationToken ct);
    Task<IEnumerable<TrainingPlan>> GetAllWithWorkouts(CancellationToken ct);
    Task<IEnumerable<TrainingPlan>> GetActive(ETrainingObjective? objective, ETrainingLevel? level, CancellationToken ct);
    Task<IEnumerable<TrainingPlan>> GetByCreator(Guid creatorId, CancellationToken ct);
    Task<TrainingPlan?> GetWithWorkoutsAndItemsByCreator(Guid id, Guid creatorId, CancellationToken ct);
}
