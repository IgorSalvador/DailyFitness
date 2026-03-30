using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Interfaces.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<bool> GetIfAlreadyExist(string email, CancellationToken ct);
    Task<User?> GetByEmail(string email, CancellationToken ct);
    Task AddResetPasswordRequest(ResetPasswordRequest request, CancellationToken ct);
    Task CancelActiveResetPasswordRequest(Guid userId, CancellationToken ct);
}
