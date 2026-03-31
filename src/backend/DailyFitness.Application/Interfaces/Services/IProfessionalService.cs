using DailyFitness.Application.Common.Results;
using DailyFitness.Application.Dtos.Professional;

namespace DailyFitness.Application.Interfaces.Services;

public interface IProfessionalService
{
    Task<ResultDto<ProfessionalRequestDto>> CreateProfessionalRequest(CreateProfessionalRequestDto model,
        CancellationToken cancellationToken);
}
