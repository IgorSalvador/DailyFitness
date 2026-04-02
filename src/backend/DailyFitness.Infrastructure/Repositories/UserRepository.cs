using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Domain.Common;
using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;
using DailyFitness.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DailyFitness.Infrastructure.Repositories;

public class UserRepository(AppDbContext context) : Repository<User>(context), IUserRepository
{
    private readonly AppDbContext _context = context;

    public async Task<bool> GetIfAlreadyExist(string email, CancellationToken ct)
    {
        return await set.AnyAsync(x => x.Email.ToLower() == email.ToLower(), ct);
    }

    public async Task<User?> GetByEmail(string email, CancellationToken ct)
    {
        return await set.FirstOrDefaultAsync(x => x.Email.ToLower() == email.ToLower(), ct);
    }

    public async Task AddResetPasswordRequest(ResetPasswordRequest request, CancellationToken ct)
    {
        await _context.ResetPasswordRequests.AddAsync(request, ct);
        await SaveChanges(ct);
    }

    public async Task CancelActiveResetPasswordRequest(Guid userId, CancellationToken ct)
    {
        var requests = await _context.ResetPasswordRequests
            .Where(x => x.UserId == userId && x.Status == EntityStatus.Active)
            .ToListAsync(ct);

        foreach (var request in requests)
            request.SetAsInactive();

        await SaveChanges(ct);
    }

    public async Task<ResetPasswordRequest?> GetActiveResetPasswordRequestWithUserByToken(string token,
        CancellationToken ct)
    {
        return await _context.ResetPasswordRequests
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Token.ToLower() == token.ToLower()
                                      && x.Status == EntityStatus.Active, ct);
    }

    public async Task<List<User>> GetProfessionalUsers(CancellationToken ct)
    {
        return await set
            .Include(x => x.ProfessionalRequests)
            .Where(x => x.Profile == EUserProfile.Professional
                        && x.Status == EntityStatus.Active
                        && x.ProfessionalRequests != null
                        && x.ProfessionalRequests.Any(y =>
                            y.Status == EntityStatus.Active &&
                            y.ProfessionalRequestStatus == EProfessionalRequestStatus.Approved))
            .ToListAsync(ct);
    }
}
