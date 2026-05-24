using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Interfaces.Repositories;

public interface IUserDietPlanRepository : IRepository<UserDietPlan>
{
    Task<UserDietPlan?> GetActiveByUserIdAsync(Guid userId, CancellationToken ct);
    Task<UserDietPlan?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct);
    Task<UserDietPlan?> GetByUserAndPlanIdAsync(Guid userId, Guid planId, CancellationToken ct);
    Task<IEnumerable<UserDietPlan>> GetHistoryByUserIdAsync(Guid userId, CancellationToken ct);
    Task<UserDietPlan?> GetSubscriberProgressAsync(Guid planId, Guid userId, CancellationToken ct);
}
