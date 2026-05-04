using DailyFitness.Application.Common.Results;
using DailyFitness.Application.Dtos.Challenge;

namespace DailyFitness.Application.Interfaces.Services;

public interface IChallengeService
{
    // Admin
    Task<ResultDto<ChallengeDto>> CreateChallenge(CreateChallengeDto model, CancellationToken ct);
    Task<ResultDto<ChallengeDto>> UpdateChallenge(Guid id, UpdateChallengeDto model, CancellationToken ct);
    Task<ResultDto<IEnumerable<ChallengeDto>>> GetChallenges(CancellationToken ct);
    Task<ResultDto<ChallengeDto>> GetChallenge(Guid id, CancellationToken ct);
    Task<ResultDto<ChallengeDto>> DiscontinueChallenge(Guid id, CancellationToken ct);
    Task<ResultDto<IEnumerable<UserChallengeDto>>> GetChallengeParticipants(Guid challengeId, CancellationToken ct);

    // Professional
    Task<ResultDto<ChallengeDto>> CreateManagedChallenge(CreateChallengeDto model, Guid creatorId, CancellationToken ct);
    Task<ResultDto<IEnumerable<ChallengeDto>>> GetManagedChallenges(Guid creatorId, CancellationToken ct);
    Task<ResultDto<ChallengeDto>> GetManagedChallenge(Guid id, Guid creatorId, CancellationToken ct);
    Task<ResultDto<ChallengeDto>> UpdateManagedChallenge(Guid id, UpdateChallengeDto model, Guid creatorId, CancellationToken ct);
    Task<ResultDto<ChallengeDto>> DiscontinueManagedChallenge(Guid id, Guid creatorId, CancellationToken ct);

    // User
    Task<ResultDto<IEnumerable<ChallengeDto>>> GetAvailableChallenges(Guid userId, CancellationToken ct);
    Task<ResultDto<UserChallengeDto>> JoinChallenge(Guid challengeId, Guid userId, CancellationToken ct);
    Task<ResultDto<IEnumerable<UserChallengeDto>>> GetMyChallenges(Guid userId, CancellationToken ct);
    Task<ResultDto<UserChallengeDto>> GetMyChallengeDetails(Guid userChallengeId, Guid userId, CancellationToken ct);
    Task<ResultDto<UserChallengeDto>> UpdateProgress(Guid userChallengeId, Guid userId, UpdateChallengeProgressDto model, CancellationToken ct);
    Task<ResultDto<UserChallengeDto>> LeaveChallenge(Guid userChallengeId, Guid userId, CancellationToken ct);
}
