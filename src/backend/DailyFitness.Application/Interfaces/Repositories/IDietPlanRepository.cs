using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Interfaces.Repositories;

public interface IDietPlanRepository : IRepository<DietPlan>
{
    Task<IEnumerable<DietPlan>> GetAllWithMealsAsync(CancellationToken ct);
    Task<DietPlan?> GetByIdWithMealsAsync(Guid id, CancellationToken ct);
    Task<IEnumerable<DietPlan>> GetAvailablePlansAsync(EDietObjective? objective, EDietLevel? level, CancellationToken ct);
    Task<IEnumerable<DietPlan>> GetByCreatorAsync(Guid creatorId, CancellationToken ct);
    Task<DietPlan?> GetByCreatorAndIdAsync(Guid id, Guid creatorId, CancellationToken ct);
    Task<IEnumerable<UserDietPlan>> GetSubscribersAsync(Guid planId, CancellationToken ct);
}
