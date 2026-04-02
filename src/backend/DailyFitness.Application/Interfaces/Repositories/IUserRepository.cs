using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Interfaces.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<bool> GetIfAlreadyExist(string email, CancellationToken ct);
    Task<User?> GetByEmail(string email, CancellationToken ct);
    Task AddResetPasswordRequest(ResetPasswordRequest request, CancellationToken ct);
    Task<ResetPasswordRequest?> GetActiveResetPasswordRequestWithUserByToken(string token, CancellationToken ct);
    Task CancelActiveResetPasswordRequest(Guid userId, CancellationToken ct);
    Task<User?> GetProfessionalUser(Guid id, CancellationToken ct);
    Task<List<User>> GetProfessionalUsers(CancellationToken ct);
}
