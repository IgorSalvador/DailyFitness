using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Domain.Entities;
using DailyFitness.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DailyFitness.Infrastructure.Repositories;

public class ProfessionalRequestRepository (AppDbContext context)
    : Repository<ProfessionalRequest>(context), IProfessionalRequestRepository
{
    public async Task<ProfessionalRequest?> GetWithUser(Guid id, CancellationToken ct)
    {
        return await set
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public async Task<ProfessionalRequest?> GetWithAll(Guid id, CancellationToken ct)
    {
        return await set
            .Include(x => x.User)
            .Include(x => x.Evaluator)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
    }
}
