using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Interfaces.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<bool> GetIfAlreadyExist(string email);
}
