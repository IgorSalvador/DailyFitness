using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Domain.Entities;
using DailyFitness.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DailyFitness.Infrastructure.Repositories;

public class UserRepository(AppDbContext context) : Repository<User>(context), IUserRepository
{
    public async Task<bool> GetIfAlreadyExist(string email)
    {
        return await set.AnyAsync(x => x.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
    }
}
