using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Interfaces.Repositories;

public interface IChallengeRepository : IRepository<Challenge>
{
    Task<Challenge?> GetWithParticipants(Guid id, CancellationToken ct);
    Task<IEnumerable<Challenge>> GetAllWithParticipants(CancellationToken ct);
    Task<IEnumerable<Challenge>> GetAvailableForUser(Guid userId, CancellationToken ct);
    Task<bool> HasParticipants(Guid challengeId, CancellationToken ct);
    Task<IEnumerable<Challenge>> GetByCreator(Guid creatorId, CancellationToken ct);
    Task<Challenge?> GetWithParticipantsByCreator(Guid id, Guid creatorId, CancellationToken ct);
}
