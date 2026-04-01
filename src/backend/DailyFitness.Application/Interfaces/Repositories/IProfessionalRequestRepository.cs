using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Interfaces.Repositories;

public interface IProfessionalRequestRepository : IRepository<ProfessionalRequest>
{
    Task<ProfessionalRequest?> GetWithUser(Guid id, CancellationToken ct);
    Task<ProfessionalRequest?> GetWithAll(Guid id, CancellationToken ct);
}
