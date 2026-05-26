using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Interfaces.Repositories;

public interface IUserDietProgressRepository : IRepository<UserDietProgress>
{
    Task<UserDietProgress?> GetByKeyAsync(Guid userDietPlanId, Guid dietMealItemId, DateOnly date, CancellationToken ct);
    Task<IEnumerable<UserDietProgress>> GetByPlanAsync(Guid userDietPlanId, CancellationToken ct);
    Task<IEnumerable<UserDietProgress>> GetByPlanAndDateAsync(Guid userDietPlanId, DateOnly date, CancellationToken ct);
    Task<IEnumerable<UserDietProgress>> GetByMealAndDateAsync(Guid userDietPlanId, Guid dietMealId, DateOnly date, CancellationToken ct);
}
