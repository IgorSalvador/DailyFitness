using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Interfaces.Repositories;

public interface IUserDietMealDailyLogRepository : IRepository<UserDietMealDailyLog>
{
    Task<UserDietMealDailyLog?> GetByKeyAsync(Guid userDietPlanId, Guid dietMealId, DateOnly date, CancellationToken ct);
    Task<IEnumerable<UserDietMealDailyLog>> GetByPlanAndDateAsync(Guid userDietPlanId, DateOnly date, CancellationToken ct);
}
