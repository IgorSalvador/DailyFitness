using DailyFitness.Application.Common.Results;
using DailyFitness.Application.Dtos.Professional;
using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Application.Interfaces.Services;
using DailyFitness.Application.Validators.Professional;
using DailyFitness.Domain.Common;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Services;

public class ProfessionalService(
    IUserRepository userRepository,
    IProfessionalRequestRepository professionalRequestRepository,
    IEmailService emailService)
    : BaseService, IProfessionalService
{
    public async Task<ResultDto<ProfessionalRequestDto>> CreateProfessionalRequest(CreateProfessionalRequestDto model, CancellationToken cancellationToken)
    {
        var validationResult = ExecuteValidation(new CreateProfessionalRequestDtoValidator(), model);

        if(!validationResult.IsValid)
            return ResultDto<ProfessionalRequestDto>.Fail("Falha de validação", validationResult.Errors.Select(x => x.ErrorMessage).ToList());

        var professionalRequest = model.ToEntity();

        var existingRequests =
            await professionalRequestRepository.Find(x => x.UserId == professionalRequest.UserId
                && x.ProfessionalRequestStatus == EProfessionalRequestStatus.Pending
                || x.ProfessionalRequestStatus == EProfessionalRequestStatus.Approved
                , cancellationToken);

        if(existingRequests.Any())
            return ResultDto<ProfessionalRequestDto>.Fail("Já existe uma solicitação pendente");

        var user = await userRepository.Get(professionalRequest.UserId, cancellationToken);

        if(user == null)
            return ResultDto<ProfessionalRequestDto>.Fail("Falha de validação", ["Usuário não encontrado"]);

        professionalRequestRepository.Add(professionalRequest);
        await professionalRequestRepository.SaveChanges(cancellationToken);

        var administrators = await userRepository.Find(x => x.Status == EntityStatus.Active && x.Profile == EUserProfile.Administrator, cancellationToken);

        await emailService.SendUserProfessionalRequestForAdministratorsEmail(administrators.Select(x => x.Email).ToList(), cancellationToken);
        await emailService.SendUserProfessionalRequestEmail(user, cancellationToken);

        return ResultDto<ProfessionalRequestDto>.Ok(ProfessionalRequestDto.FromEntity(professionalRequest));
    }

    public async Task<ResultDto<ProfessionalRequestDto>> Get(GetProfessionalRequestDto model, CancellationToken ct)
    {
        var professionalRequestId = Guid.Parse(model.Id);
        var professionalRequest = await professionalRequestRepository.GetWithAll(professionalRequestId, ct);

        return professionalRequest is not null ?
            ResultDto<ProfessionalRequestDto>.Ok(ProfessionalRequestDto.FromEntity(professionalRequest)) :
            ResultDto<ProfessionalRequestDto>.Fail("Solicitação não encontrada");
    }

    public async Task<ResultDto<ProfessionalRequestDto>> EvaluateRequest(ProfessionalRequestEvaluationDto model,
        Guid evaluatorId, CancellationToken ct)
    {
        var validationResult = ExecuteValidation(new ProfessionalRequestEvaluationDtoValidator(), model);

        if(!validationResult.IsValid)
            return ResultDto<ProfessionalRequestDto>.Fail("Falha de validação", validationResult.Errors.Select(x => x.ErrorMessage).ToList());

        var requestId = Guid.Parse(model.ProfessionalRequestId);

        var professionalRequest = await professionalRequestRepository.GetWithUser(requestId, ct);

        if(professionalRequest == null)
            return ResultDto<ProfessionalRequestDto>.Fail("Falha de validação", ["Solicitação não encontrada"]);

        professionalRequest.SetAsEvaluated(evaluatorId, model.IsApproved, model.Comments);

        professionalRequestRepository.Update(professionalRequest);
        await professionalRequestRepository.SaveChanges(ct);

        await emailService.SendUserProfessionalRequestFeedbackEmail(professionalRequest, ct);

        return ResultDto<ProfessionalRequestDto>.Ok(ProfessionalRequestDto.FromEntity(professionalRequest));
    }
}
