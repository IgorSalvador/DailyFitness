using DailyFitness.Application.Common.Results;
using DailyFitness.Application.Dtos.Professional;

namespace DailyFitness.Application.Interfaces.Services;

public interface IProfessionalService
{
    Task<ResultDto<IEnumerable<ProfessionalDto>>> Get(CancellationToken cancellationToken);
    Task<ResultDto<ProfessionalRequestDto>> CreateProfessionalRequest(CreateProfessionalRequestDto model,
        CancellationToken cancellationToken);
    Task<ResultDto<ProfessionalRequestDto>> GetProfessionalRequest(GetProfessionalRequestDto model, CancellationToken ct);
    Task<ResultDto<ProfessionalRequestDto>> EvaluateRequest(ProfessionalRequestEvaluationDto model,
        Guid evaluatorId, CancellationToken ct);

}
