using System.Globalization;
using DailyFitness.Application.Common.Results;
using DailyFitness.Application.Dtos.Challenge;
using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Application.Interfaces.Services;
using DailyFitness.Application.Validators.Challenge;
using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Services;

public class ChallengeService(
    IChallengeRepository challengeRepository,
    IUserChallengeRepository userChallengeRepository,
    IUserChallengeProgressRepository userChallengeProgressRepository,
    IEmailService emailService)
    : BaseService, IChallengeService
{
    // ── Admin ────────────────────────────────────────────────────────────────

    public async Task<ResultDto<ChallengeDto>> CreateChallenge(CreateChallengeDto model, CancellationToken ct)
    {
        var validationResult = ExecuteValidation(new CreateChallengeDtoValidator(), model);

        if (!validationResult.IsValid)
            return ResultDto<ChallengeDto>.Fail("Falha de validação", validationResult.Errors.Select(x => x.ErrorMessage).ToList());

        var challenge = model.ToEntity();

        challengeRepository.Add(challenge);
        await challengeRepository.SaveChanges(ct);

        return ResultDto<ChallengeDto>.Ok(ChallengeDto.FromEntity(challenge), "Desafio criado com sucesso!");
    }

    public async Task<ResultDto<ChallengeDto>> UpdateChallenge(Guid id, UpdateChallengeDto model, CancellationToken ct)
    {
        var validationResult = ExecuteValidation(new UpdateChallengeDtoValidator(), model);

        if (!validationResult.IsValid)
            return ResultDto<ChallengeDto>.Fail("Falha de validação", validationResult.Errors.Select(x => x.ErrorMessage).ToList());

        var challenge = await challengeRepository.GetWithParticipants(id, ct);

        if (challenge is null)
            return ResultDto<ChallengeDto>.Fail("Falha de validação", ["Desafio não encontrado."]);

        if (model.Type.HasValue && model.Type.Value != challenge.Type)
        {
            var hasParticipants = await challengeRepository.HasParticipants(id, ct);

            if (hasParticipants)
                return ResultDto<ChallengeDto>.Fail("Falha de validação", ["Não é possível alterar o tipo do desafio com participantes vinculados."]);
        }

        challenge.Update(model.Name, model.Description, model.ExpectedEndDate, model.Type, model.ChallengeStatus);

        challengeRepository.Update(challenge);
        await challengeRepository.SaveChanges(ct);

        return ResultDto<ChallengeDto>.Ok(ChallengeDto.FromEntity(challenge), "Desafio atualizado com sucesso!");
    }

    public async Task<ResultDto<IEnumerable<ChallengeDto>>> GetChallenges(CancellationToken ct)
    {
        var challenges = await challengeRepository.GetAllWithParticipants(ct);

        return ResultDto<IEnumerable<ChallengeDto>>.Ok(challenges.Select(ChallengeDto.FromEntity));
    }

    public async Task<ResultDto<ChallengeDto>> GetChallenge(Guid id, CancellationToken ct)
    {
        var challenge = await challengeRepository.GetWithParticipants(id, ct);

        return challenge is not null
            ? ResultDto<ChallengeDto>.Ok(ChallengeDto.FromEntity(challenge))
            : ResultDto<ChallengeDto>.Fail("Desafio não encontrado.");
    }

    public async Task<ResultDto<ChallengeDto>> DiscontinueChallenge(Guid id, CancellationToken ct)
    {
        var challenge = await challengeRepository.GetWithParticipants(id, ct);

        if (challenge is null)
            return ResultDto<ChallengeDto>.Fail("Falha de validação", ["Desafio não encontrado."]);

        if (challenge.ChallengeStatus == EChallengeStatus.Discontinued)
            return ResultDto<ChallengeDto>.Fail("Falha de validação", ["Desafio já está descontinuado."]);

        var activeParticipations = await userChallengeRepository.GetActiveByChallenge(id, ct);

        foreach (var participation in activeParticipations)
        {
            participation.Discontinue();
            userChallengeRepository.Update(participation);
        }

        challenge.Discontinue();
        challengeRepository.Update(challenge);
        await challengeRepository.SaveChanges(ct);

        var notificationTasks = activeParticipations
            .Where(p => p.User is not null)
            .Select(p => emailService.SendChallengeDiscontinuedEmail(
                p.User!.Email, p.User.FirstName, challenge.Name, ct));

        await Task.WhenAll(notificationTasks);

        return ResultDto<ChallengeDto>.Ok(ChallengeDto.FromEntity(challenge), "Desafio descontinuado com sucesso!");
    }

    public async Task<ResultDto<IEnumerable<UserChallengeDto>>> GetChallengeParticipants(Guid challengeId, CancellationToken ct)
    {
        var challenge = await challengeRepository.Get(challengeId, ct);

        if (challenge is null)
            return ResultDto<IEnumerable<UserChallengeDto>>.Fail("Desafio não encontrado.");

        var participants = await userChallengeRepository.GetByChallengeWithUser(challengeId, ct);

        return ResultDto<IEnumerable<UserChallengeDto>>.Ok(participants.Select(UserChallengeDto.FromEntity));
    }

    // ── Professional ─────────────────────────────────────────────────────────

    public async Task<ResultDto<ChallengeDto>> CreateManagedChallenge(CreateChallengeDto model, Guid creatorId, CancellationToken ct)
    {
        var validationResult = ExecuteValidation(new CreateChallengeDtoValidator(), model);

        if (!validationResult.IsValid)
            return ResultDto<ChallengeDto>.Fail("Falha de validação", validationResult.Errors.Select(x => x.ErrorMessage).ToList());

        var challenge = model.ToEntity(creatorId);

        challengeRepository.Add(challenge);
        await challengeRepository.SaveChanges(ct);

        return ResultDto<ChallengeDto>.Ok(ChallengeDto.FromEntity(challenge), "Desafio criado com sucesso!");
    }

    public async Task<ResultDto<IEnumerable<ChallengeDto>>> GetManagedChallenges(Guid creatorId, CancellationToken ct)
    {
        var challenges = await challengeRepository.GetByCreator(creatorId, ct);

        return ResultDto<IEnumerable<ChallengeDto>>.Ok(challenges.Select(ChallengeDto.FromEntity));
    }

    public async Task<ResultDto<ChallengeDto>> GetManagedChallenge(Guid id, Guid creatorId, CancellationToken ct)
    {
        var challenge = await challengeRepository.GetWithParticipantsByCreator(id, creatorId, ct);

        return challenge is not null
            ? ResultDto<ChallengeDto>.Ok(ChallengeDto.FromEntity(challenge))
            : ResultDto<ChallengeDto>.Fail("Desafio não encontrado ou sem permissão de acesso.");
    }

    public async Task<ResultDto<ChallengeDto>> UpdateManagedChallenge(Guid id, UpdateChallengeDto model, Guid creatorId, CancellationToken ct)
    {
        var validationResult = ExecuteValidation(new UpdateChallengeDtoValidator(), model);

        if (!validationResult.IsValid)
            return ResultDto<ChallengeDto>.Fail("Falha de validação", validationResult.Errors.Select(x => x.ErrorMessage).ToList());

        var challenge = await challengeRepository.GetWithParticipantsByCreator(id, creatorId, ct);

        if (challenge is null)
            return ResultDto<ChallengeDto>.Fail("Falha de validação", ["Desafio não encontrado ou sem permissão de acesso."]);

        if (model.Type.HasValue && model.Type.Value != challenge.Type)
        {
            var hasParticipants = await challengeRepository.HasParticipants(id, ct);

            if (hasParticipants)
                return ResultDto<ChallengeDto>.Fail("Falha de validação", ["Não é possível alterar o tipo do desafio com participantes vinculados."]);
        }

        challenge.Update(model.Name, model.Description, model.ExpectedEndDate, model.Type, model.ChallengeStatus);

        challengeRepository.Update(challenge);
        await challengeRepository.SaveChanges(ct);

        return ResultDto<ChallengeDto>.Ok(ChallengeDto.FromEntity(challenge), "Desafio atualizado com sucesso!");
    }

    public async Task<ResultDto<ChallengeDto>> DiscontinueManagedChallenge(Guid id, Guid creatorId, CancellationToken ct)
    {
        var challenge = await challengeRepository.GetWithParticipantsByCreator(id, creatorId, ct);

        if (challenge is null)
            return ResultDto<ChallengeDto>.Fail("Falha de validação", ["Desafio não encontrado ou sem permissão de acesso."]);

        if (challenge.ChallengeStatus == EChallengeStatus.Discontinued)
            return ResultDto<ChallengeDto>.Fail("Falha de validação", ["Desafio já está descontinuado."]);

        var activeParticipations = await userChallengeRepository.GetActiveByChallenge(id, ct);

        foreach (var participation in activeParticipations)
        {
            participation.Discontinue();
            userChallengeRepository.Update(participation);
        }

        challenge.Discontinue();
        challengeRepository.Update(challenge);
        await challengeRepository.SaveChanges(ct);

        var notificationTasks = activeParticipations
            .Where(p => p.User is not null)
            .Select(p => emailService.SendChallengeDiscontinuedEmail(
                p.User!.Email, p.User.FirstName, challenge.Name, ct));

        await Task.WhenAll(notificationTasks);

        return ResultDto<ChallengeDto>.Ok(ChallengeDto.FromEntity(challenge), "Desafio descontinuado com sucesso!");
    }

    // ── User ─────────────────────────────────────────────────────────────────

    public async Task<ResultDto<IEnumerable<ChallengeDto>>> GetAvailableChallenges(Guid userId, CancellationToken ct)
    {
        var challenges = await challengeRepository.GetAvailableForUser(userId, ct);

        return ResultDto<IEnumerable<ChallengeDto>>.Ok(challenges.Select(ChallengeDto.FromEntity));
    }

    public async Task<ResultDto<UserChallengeDto>> JoinChallenge(Guid challengeId, Guid userId, CancellationToken ct)
    {
        var challenge = await challengeRepository.Get(challengeId, ct);

        if (challenge is null)
            return ResultDto<UserChallengeDto>.Fail("Falha de validação", ["Desafio não encontrado."]);

        if (!challenge.IsAvailableForParticipation())
            return ResultDto<UserChallengeDto>.Fail("Falha de validação", ["Este desafio não está disponível para participação."]);

        var existing = await userChallengeRepository.GetActiveByUserAndChallenge(userId, challengeId, ct);

        if (existing is not null)
            return ResultDto<UserChallengeDto>.Fail("Falha de validação", ["Você já possui uma participação ativa neste desafio."]);

        var userChallenge = new UserChallenge(userId, challengeId);

        userChallengeRepository.Add(userChallenge);
        await userChallengeRepository.SaveChanges(ct);

        var result = await userChallengeRepository.GetWithChallenge(userChallenge.Id, ct);

        return ResultDto<UserChallengeDto>.Ok(UserChallengeDto.FromEntity(result!), "Participação registrada com sucesso!");
    }

    public async Task<ResultDto<IEnumerable<UserChallengeDto>>> GetMyChallenges(Guid userId, CancellationToken ct)
    {
        var userChallenges = await userChallengeRepository.GetByUserWithChallenge(userId, ct);

        return ResultDto<IEnumerable<UserChallengeDto>>.Ok(userChallenges.Select(UserChallengeDto.FromEntity));
    }

    public async Task<ResultDto<UserChallengeDto>> GetMyChallengeDetails(Guid userChallengeId, Guid userId, CancellationToken ct)
    {
        var userChallenge = await userChallengeRepository.GetWithChallengeAndProgresses(userChallengeId, ct);

        if (userChallenge is null)
            return ResultDto<UserChallengeDto>.Fail("Participação não encontrada.");

        if (userChallenge.UserId != userId)
            return ResultDto<UserChallengeDto>.Fail("Falha de validação", ["Acesso não autorizado."]);

        return ResultDto<UserChallengeDto>.Ok(UserChallengeDto.FromEntity(userChallenge));
    }

    public async Task<ResultDto<UserChallengeDto>> UpdateProgress(Guid userChallengeId, Guid userId, UpdateChallengeProgressDto model, CancellationToken ct)
    {
        var validationResult = ExecuteValidation(new UpdateChallengeProgressDtoValidator(), model);

        if (!validationResult.IsValid)
            return ResultDto<UserChallengeDto>.Fail("Falha de validação", validationResult.Errors.Select(x => x.ErrorMessage).ToList());

        var userChallenge = await userChallengeRepository.GetWithChallenge(userChallengeId, ct);

        if (userChallenge is null)
            return ResultDto<UserChallengeDto>.Fail("Falha de validação", ["Participação não encontrada."]);

        if (userChallenge.UserId != userId)
            return ResultDto<UserChallengeDto>.Fail("Falha de validação", ["Acesso não autorizado."]);

        if (userChallenge.UserChallengeStatus != EUserChallengeStatus.Active)
            return ResultDto<UserChallengeDto>.Fail("Falha de validação", ["Não é possível atualizar progresso em uma participação inativa."]);

        var challenge = userChallenge.Challenge!;

        if (!challenge.IsAvailableForParticipation())
            return ResultDto<UserChallengeDto>.Fail("Falha de validação", ["O desafio não está disponível para atualização de progresso."]);

        var now = DateTime.Now;
        var referencePeriod = CalculateReferencePeriod(challenge.Type, now);

        var existingProgress = await userChallengeProgressRepository.GetByPeriod(userChallengeId, referencePeriod, ct);

        if (existingProgress is not null)
        {
            var delta = model.ProgressValue - existingProgress.ProgressValue;
            existingProgress.Update(model.ProgressValue, model.Notes);
            userChallengeProgressRepository.Update(existingProgress);
            userChallenge.UpdateProgress(delta);
        }
        else
        {
            var progress = new UserChallengeProgress(userChallengeId, now, referencePeriod, model.ProgressValue, model.Notes);
            userChallengeProgressRepository.Add(progress);
            userChallenge.UpdateProgress(model.ProgressValue);
        }

        userChallengeRepository.Update(userChallenge);
        await userChallengeRepository.SaveChanges(ct);

        var updated = await userChallengeRepository.GetWithChallengeAndProgresses(userChallengeId, ct);

        return ResultDto<UserChallengeDto>.Ok(UserChallengeDto.FromEntity(updated!), "Progresso atualizado com sucesso!");
    }

    public async Task<ResultDto<UserChallengeDto>> LeaveChallenge(Guid userChallengeId, Guid userId, CancellationToken ct)
    {
        var userChallenge = await userChallengeRepository.GetWithChallenge(userChallengeId, ct);

        if (userChallenge is null)
            return ResultDto<UserChallengeDto>.Fail("Falha de validação", ["Participação não encontrada."]);

        if (userChallenge.UserId != userId)
            return ResultDto<UserChallengeDto>.Fail("Falha de validação", ["Acesso não autorizado."]);

        if (userChallenge.UserChallengeStatus != EUserChallengeStatus.Active)
            return ResultDto<UserChallengeDto>.Fail("Falha de validação", ["Só é possível sair de uma participação ativa."]);

        userChallenge.Leave();

        userChallengeRepository.Update(userChallenge);
        await userChallengeRepository.SaveChanges(ct);

        return ResultDto<UserChallengeDto>.Ok(UserChallengeDto.FromEntity(userChallenge), "Você saiu do desafio com sucesso.");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static string CalculateReferencePeriod(EChallengeType type, DateTime date) => type switch
    {
        EChallengeType.Daily => date.ToString("yyyy-MM-dd"),
        EChallengeType.Weekly => $"{date.Year}-W{ISOWeek.GetWeekOfYear(date):D2}",
        EChallengeType.Monthly => date.ToString("yyyy-MM"),
        _ => throw new InvalidOperationException("Tipo de desafio inválido.")
    };
}
