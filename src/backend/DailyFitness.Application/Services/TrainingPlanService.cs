using DailyFitness.Application.Common.Results;
using DailyFitness.Application.Dtos.TrainingPlan;
using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Application.Interfaces.Services;
using DailyFitness.Application.Validators.TrainingPlan;
using DailyFitness.Domain.Common;
using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Services;

public class TrainingPlanService(
    ITrainingPlanRepository trainingPlanRepository,
    IUserTrainingPlanRepository userTrainingPlanRepository,
    IUserTrainingProgressRepository userTrainingProgressRepository,
    IUserTrainingWorkoutDailyLogRepository userTrainingWorkoutDailyLogRepository)
    : BaseService, ITrainingPlanService
{
    // ── Admin ─────────────────────────────────────────────────────────────────

    public async Task<ResultDto<IEnumerable<TrainingPlanDto>>> GetAllPlans(CancellationToken ct)
    {
        var plans = await trainingPlanRepository.GetAllWithWorkouts(ct);
        return ResultDto<IEnumerable<TrainingPlanDto>>.Ok(plans.Select(TrainingPlanDto.FromEntity));
    }

    public async Task<ResultDto<TrainingPlanDto>> GetPlan(Guid id, CancellationToken ct)
    {
        var plan = await trainingPlanRepository.GetWithWorkoutsAndItems(id, ct);
        return plan is not null
            ? ResultDto<TrainingPlanDto>.Ok(TrainingPlanDto.FromEntity(plan))
            : ResultDto<TrainingPlanDto>.Fail("Plano de treino não encontrado.");
    }

    public async Task<ResultDto<TrainingPlanDto>> CreatePlan(CreateTrainingPlanDto model, Guid creatorId, CancellationToken ct)
    {
        var validation = ExecuteValidation(new CreateTrainingPlanDtoValidator(), model);
        if (!validation.IsValid)
            return ResultDto<TrainingPlanDto>.Fail("Falha de validação", validation.Errors.Select(x => x.ErrorMessage).ToList());

        var plan = BuildPlanFromCreate(model, creatorId);

        trainingPlanRepository.Add(plan);
        await trainingPlanRepository.SaveChanges(ct);

        var created = await trainingPlanRepository.GetWithWorkoutsAndItems(plan.Id, ct);
        return ResultDto<TrainingPlanDto>.Ok(TrainingPlanDto.FromEntity(created!), "Plano de treino criado com sucesso!");
    }

    public async Task<ResultDto<TrainingPlanDto>> UpdatePlan(Guid id, UpdateTrainingPlanDto model, CancellationToken ct)
    {
        var validation = ExecuteValidation(new UpdateTrainingPlanDtoValidator(), model);
        if (!validation.IsValid)
            return ResultDto<TrainingPlanDto>.Fail("Falha de validação", validation.Errors.Select(x => x.ErrorMessage).ToList());

        var plan = await trainingPlanRepository.GetWithWorkoutsAndItems(id, ct);
        if (plan is null)
            return ResultDto<TrainingPlanDto>.Fail("Falha de validação", ["Plano de treino não encontrado."]);

        ApplyPlanUpdate(plan, model);

        trainingPlanRepository.Update(plan);
        await trainingPlanRepository.SaveChanges(ct);

        var updated = await trainingPlanRepository.GetWithWorkoutsAndItems(plan.Id, ct);
        return ResultDto<TrainingPlanDto>.Ok(TrainingPlanDto.FromEntity(updated!), "Plano de treino atualizado com sucesso!");
    }

    public async Task<ResultDto<TrainingPlanDto>> ActivatePlan(Guid id, CancellationToken ct)
    {
        var plan = await trainingPlanRepository.Get(id, ct);
        if (plan is null)
            return ResultDto<TrainingPlanDto>.Fail("Falha de validação", ["Plano de treino não encontrado."]);

        try { plan.SetAsActive(); }
        catch (InvalidOperationException ex) { return ResultDto<TrainingPlanDto>.Fail("Falha de validação", [ex.Message]); }

        trainingPlanRepository.Update(plan);
        await trainingPlanRepository.SaveChanges(ct);

        return ResultDto<TrainingPlanDto>.Ok(TrainingPlanDto.FromEntity(plan), "Plano ativado com sucesso!");
    }

    public async Task<ResultDto<TrainingPlanDto>> DeactivatePlan(Guid id, CancellationToken ct)
    {
        var plan = await trainingPlanRepository.Get(id, ct);
        if (plan is null)
            return ResultDto<TrainingPlanDto>.Fail("Falha de validação", ["Plano de treino não encontrado."]);

        try { plan.SetAsInactive(); }
        catch (InvalidOperationException ex) { return ResultDto<TrainingPlanDto>.Fail("Falha de validação", [ex.Message]); }

        trainingPlanRepository.Update(plan);
        await trainingPlanRepository.SaveChanges(ct);

        return ResultDto<TrainingPlanDto>.Ok(TrainingPlanDto.FromEntity(plan), "Plano inativado com sucesso!");
    }

    public async Task<ResultDto<IEnumerable<TrainingPlanSubscriberDto>>> GetPlanSubscribers(Guid planId, CancellationToken ct)
    {
        var plan = await trainingPlanRepository.Get(planId, ct);
        if (plan is null)
            return ResultDto<IEnumerable<TrainingPlanSubscriberDto>>.Fail("Plano de treino não encontrado.");

        var subscribers = await userTrainingPlanRepository.GetByPlanWithUser(planId, ct);
        return ResultDto<IEnumerable<TrainingPlanSubscriberDto>>.Ok(subscribers.Select(TrainingPlanSubscriberDto.FromEntity));
    }

    public async Task<ResultDto<UserTrainingPlanDto>> GetSubscriberProgress(Guid planId, Guid userId, CancellationToken ct)
    {
        var utp = await userTrainingPlanRepository.GetByUser(userId, ct);
        var record = utp.FirstOrDefault(x => x.TrainingPlanId == planId);
        if (record is null)
            return ResultDto<UserTrainingPlanDto>.Fail("Inscrição não encontrada.");

        var full = await userTrainingPlanRepository.GetWithPlanAndProgress(record.Id, ct);
        return ResultDto<UserTrainingPlanDto>.Ok(UserTrainingPlanDto.FromEntity(full!));
    }

    // ── Professional ──────────────────────────────────────────────────────────

    public async Task<ResultDto<IEnumerable<TrainingPlanDto>>> GetManagedPlans(Guid creatorId, CancellationToken ct)
    {
        var plans = await trainingPlanRepository.GetByCreator(creatorId, ct);
        return ResultDto<IEnumerable<TrainingPlanDto>>.Ok(plans.Select(TrainingPlanDto.FromEntity));
    }

    public async Task<ResultDto<TrainingPlanDto>> GetManagedPlan(Guid id, Guid creatorId, CancellationToken ct)
    {
        var plan = await trainingPlanRepository.GetWithWorkoutsAndItemsByCreator(id, creatorId, ct);
        return plan is not null
            ? ResultDto<TrainingPlanDto>.Ok(TrainingPlanDto.FromEntity(plan))
            : ResultDto<TrainingPlanDto>.Fail("Plano não encontrado ou sem permissão de acesso.");
    }

    public async Task<ResultDto<TrainingPlanDto>> CreateManagedPlan(CreateTrainingPlanDto model, Guid creatorId, CancellationToken ct)
        => await CreatePlan(model, creatorId, ct);

    public async Task<ResultDto<TrainingPlanDto>> UpdateManagedPlan(Guid id, UpdateTrainingPlanDto model, Guid creatorId, CancellationToken ct)
    {
        var validation = ExecuteValidation(new UpdateTrainingPlanDtoValidator(), model);
        if (!validation.IsValid)
            return ResultDto<TrainingPlanDto>.Fail("Falha de validação", validation.Errors.Select(x => x.ErrorMessage).ToList());

        var plan = await trainingPlanRepository.GetWithWorkoutsAndItemsByCreator(id, creatorId, ct);
        if (plan is null)
            return ResultDto<TrainingPlanDto>.Fail("Falha de validação", ["Plano não encontrado ou sem permissão de acesso."]);

        ApplyPlanUpdate(plan, model);

        trainingPlanRepository.Update(plan);
        await trainingPlanRepository.SaveChanges(ct);

        var updated = await trainingPlanRepository.GetWithWorkoutsAndItems(plan.Id, ct);
        return ResultDto<TrainingPlanDto>.Ok(TrainingPlanDto.FromEntity(updated!), "Plano de treino atualizado com sucesso!");
    }

    public async Task<ResultDto<TrainingPlanDto>> ActivateManagedPlan(Guid id, Guid creatorId, CancellationToken ct)
    {
        var plan = await trainingPlanRepository.GetWithWorkoutsAndItemsByCreator(id, creatorId, ct);
        if (plan is null)
            return ResultDto<TrainingPlanDto>.Fail("Falha de validação", ["Plano não encontrado ou sem permissão de acesso."]);

        try { plan.SetAsActive(); }
        catch (InvalidOperationException ex) { return ResultDto<TrainingPlanDto>.Fail("Falha de validação", [ex.Message]); }

        trainingPlanRepository.Update(plan);
        await trainingPlanRepository.SaveChanges(ct);

        return ResultDto<TrainingPlanDto>.Ok(TrainingPlanDto.FromEntity(plan), "Plano ativado com sucesso!");
    }

    public async Task<ResultDto<TrainingPlanDto>> DeactivateManagedPlan(Guid id, Guid creatorId, CancellationToken ct)
    {
        var plan = await trainingPlanRepository.GetWithWorkoutsAndItemsByCreator(id, creatorId, ct);
        if (plan is null)
            return ResultDto<TrainingPlanDto>.Fail("Falha de validação", ["Plano não encontrado ou sem permissão de acesso."]);

        try { plan.SetAsInactive(); }
        catch (InvalidOperationException ex) { return ResultDto<TrainingPlanDto>.Fail("Falha de validação", [ex.Message]); }

        trainingPlanRepository.Update(plan);
        await trainingPlanRepository.SaveChanges(ct);

        return ResultDto<TrainingPlanDto>.Ok(TrainingPlanDto.FromEntity(plan), "Plano inativado com sucesso!");
    }

    public async Task<ResultDto<IEnumerable<TrainingPlanSubscriberDto>>> GetManagedPlanSubscribers(Guid planId, Guid creatorId, CancellationToken ct)
    {
        var plan = await trainingPlanRepository.GetWithWorkoutsAndItemsByCreator(planId, creatorId, ct);
        if (plan is null)
            return ResultDto<IEnumerable<TrainingPlanSubscriberDto>>.Fail("Plano não encontrado ou sem permissão de acesso.");

        var subscribers = await userTrainingPlanRepository.GetByPlanWithUser(planId, ct);
        return ResultDto<IEnumerable<TrainingPlanSubscriberDto>>.Ok(subscribers.Select(TrainingPlanSubscriberDto.FromEntity));
    }

    public async Task<ResultDto<UserTrainingPlanDto>> GetManagedSubscriberProgress(Guid planId, Guid userId, Guid creatorId, CancellationToken ct)
    {
        var plan = await trainingPlanRepository.GetWithWorkoutsAndItemsByCreator(planId, creatorId, ct);
        if (plan is null)
            return ResultDto<UserTrainingPlanDto>.Fail("Plano não encontrado ou sem permissão de acesso.");

        return await GetSubscriberProgress(planId, userId, ct);
    }

    // ── User ──────────────────────────────────────────────────────────────────

    public async Task<ResultDto<IEnumerable<TrainingPlanDto>>> GetAvailablePlans(ETrainingObjective? objective, ETrainingLevel? level, CancellationToken ct)
    {
        var plans = await trainingPlanRepository.GetActive(objective, level, ct);
        return ResultDto<IEnumerable<TrainingPlanDto>>.Ok(plans.Select(TrainingPlanDto.FromEntity));
    }

    public async Task<ResultDto<TrainingPlanDto>> GetPlanDetail(Guid id, CancellationToken ct)
    {
        var plan = await trainingPlanRepository.GetWithWorkoutsAndItems(id, ct);
        if (plan is null)
            return ResultDto<TrainingPlanDto>.Fail("Plano de treino não encontrado.");

        if (!plan.IsAvailableForSubscription())
            return ResultDto<TrainingPlanDto>.Fail("Este plano de treino não está disponível.");

        return ResultDto<TrainingPlanDto>.Ok(TrainingPlanDto.FromEntity(plan));
    }

    public async Task<ResultDto<UserTrainingPlanDto>> SubscribePlan(Guid planId, Guid userId, CancellationToken ct)
    {
        var existing = await userTrainingPlanRepository.GetActiveByUser(userId, ct);
        if (existing is not null)
            return ResultDto<UserTrainingPlanDto>.Fail("Falha de validação", ["Você já possui um plano de treino ativo. Cancele o atual antes de se associar a outro."]);

        var plan = await trainingPlanRepository.Get(planId, ct);
        if (plan is null)
            return ResultDto<UserTrainingPlanDto>.Fail("Falha de validação", ["Plano de treino não encontrado."]);

        if (!plan.IsAvailableForSubscription())
            return ResultDto<UserTrainingPlanDto>.Fail("Falha de validação", ["Este plano de treino não está disponível para inscrição."]);

        var utp = new UserTrainingPlan(userId, planId);
        userTrainingPlanRepository.Add(utp);
        await userTrainingPlanRepository.SaveChanges(ct);

        var created = await userTrainingPlanRepository.GetWithPlanAndProgress(utp.Id, ct);
        return ResultDto<UserTrainingPlanDto>.Ok(UserTrainingPlanDto.FromEntity(created!), "Inscrição realizada com sucesso!");
    }

    public async Task<ResultDto<UserTrainingPlanDto>> CancelSubscription(Guid userId, CancelTrainingPlanDto model, CancellationToken ct)
    {
        var utp = await userTrainingPlanRepository.GetActiveByUser(userId, ct);
        if (utp is null)
            return ResultDto<UserTrainingPlanDto>.Fail("Falha de validação", ["Você não possui um plano de treino ativo."]);

        utp.Cancel(model.Reason);
        userTrainingPlanRepository.Update(utp);
        await userTrainingPlanRepository.SaveChanges(ct);

        return ResultDto<UserTrainingPlanDto>.Ok(UserTrainingPlanDto.FromEntity(utp), "Inscrição cancelada com sucesso.");
    }

    public async Task<ResultDto<UserTrainingPlanDto>> GetCurrentPlan(Guid userId, CancellationToken ct)
    {
        var utp = await userTrainingPlanRepository.GetActiveByUser(userId, ct);
        if (utp is null)
            return ResultDto<UserTrainingPlanDto>.Fail("Você não possui um plano de treino ativo.");

        var full = await userTrainingPlanRepository.GetWithPlanAndProgress(utp.Id, ct);
        return ResultDto<UserTrainingPlanDto>.Ok(UserTrainingPlanDto.FromEntity(full!));
    }

    public async Task<ResultDto<UserTrainingPlanDto>> GetCurrentPlanProgress(Guid userId, CancellationToken ct)
        => await GetCurrentPlan(userId, ct);

    public async Task<ResultDto<UserTrainingPlanDto>> MarkItemProgress(Guid userId, Guid workoutId, Guid itemId, MarkTrainingItemProgressDto model, CancellationToken ct)
    {
        var utp = await userTrainingPlanRepository.GetActiveByUser(userId, ct);
        if (utp is null)
            return ResultDto<UserTrainingPlanDto>.Fail("Falha de validação", ["Você não possui um plano de treino ativo."]);

        if (!utp.IsActive())
            return ResultDto<UserTrainingPlanDto>.Fail("Falha de validação", ["Não é possível registrar progresso em um plano inativo."]);

        // Verifica que o treino e o item pertencem ao plano ativo
        var workout = utp.TrainingPlan?.Workouts.FirstOrDefault(w => w.Id == workoutId && w.Status == EntityStatus.Active);
        if (workout is null)
            return ResultDto<UserTrainingPlanDto>.Fail("Falha de validação", ["Treino não encontrado ou inativo neste plano."]);

        var item = workout.Items.FirstOrDefault(i => i.Id == itemId && i.Status == EntityStatus.Active);
        if (item is null)
            return ResultDto<UserTrainingPlanDto>.Fail("Falha de validação", ["Exercício não encontrado ou inativo neste treino."]);

        var today = (model.ProgressDate ?? DateTime.Now).Date;

        // Verifica duplicidade
        var existing = await userTrainingProgressRepository.GetByPlanItemAndDate(utp.Id, itemId, today, ct);
        if (existing is not null)
            return ResultDto<UserTrainingPlanDto>.Fail("Falha de validação", ["Este exercício já foi marcado hoje."]);

        // Registra o progresso
        var progress = new UserTrainingProgress(utp.Id, workoutId, itemId, today);
        userTrainingProgressRepository.Add(progress);

        // Recalcula daily log
        await RecalculateDailyLog(utp.Id, workoutId, workout, today, ct);

        await userTrainingProgressRepository.SaveChanges(ct);

        // Verifica se pode completar o plano
        await TryCompleteUserTrainingPlan(utp, ct);

        var full = await userTrainingPlanRepository.GetWithPlanAndProgress(utp.Id, ct);
        return ResultDto<UserTrainingPlanDto>.Ok(UserTrainingPlanDto.FromEntity(full!), "Progresso registrado com sucesso!");
    }

    public async Task<ResultDto<UserTrainingWorkoutDailyLogDto>> FinishWorkoutDay(Guid userId, Guid workoutId, CancellationToken ct)
    {
        var utp = await userTrainingPlanRepository.GetActiveByUser(userId, ct);
        if (utp is null)
            return ResultDto<UserTrainingWorkoutDailyLogDto>.Fail("Falha de validação", ["Você não possui um plano de treino ativo."]);

        var workout = utp.TrainingPlan?.Workouts.FirstOrDefault(w => w.Id == workoutId && w.Status == EntityStatus.Active);
        if (workout is null)
            return ResultDto<UserTrainingWorkoutDailyLogDto>.Fail("Falha de validação", ["Treino não encontrado neste plano."]);

        var today = DateTime.Now.Date;
        var log = await userTrainingWorkoutDailyLogRepository.GetByPlanWorkoutAndDate(utp.Id, workoutId, today, ct);

        if (log is null)
            return ResultDto<UserTrainingWorkoutDailyLogDto>.Fail("Falha de validação", ["Nenhum progresso registrado hoje para este treino."]);

        if (log.IsFinished)
            return ResultDto<UserTrainingWorkoutDailyLogDto>.Fail("Falha de validação", ["O treino de hoje já foi finalizado."]);

        var activeItemCount = workout.Items.Count(i => i.Status == EntityStatus.Active);
        var completedToday = await userTrainingProgressRepository.GetByPlanAndWorkoutAndDate(utp.Id, workoutId, today, ct);

        if (completedToday.Count() < activeItemCount)
            return ResultDto<UserTrainingWorkoutDailyLogDto>.Fail("Falha de validação", ["Ainda há exercícios pendentes para finalizar o treino de hoje."]);

        log.Finish();
        userTrainingWorkoutDailyLogRepository.Update(log);
        await userTrainingWorkoutDailyLogRepository.SaveChanges(ct);

        return ResultDto<UserTrainingWorkoutDailyLogDto>.Ok(UserTrainingWorkoutDailyLogDto.FromEntity(log), "Treino do dia finalizado!");
    }

    public async Task<ResultDto<IEnumerable<UserTrainingPlanDto>>> GetHistory(Guid userId, CancellationToken ct)
    {
        var records = await userTrainingPlanRepository.GetByUser(userId, ct);
        return ResultDto<IEnumerable<UserTrainingPlanDto>>.Ok(records.Select(UserTrainingPlanDto.FromEntity));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static TrainingPlan BuildPlanFromCreate(CreateTrainingPlanDto model, Guid creatorId)
    {
        var plan = new TrainingPlan(
            model.Name, model.Description, model.Objective,
            model.Level, model.MinimumDurationDays, model.Instructions, creatorId);

        foreach (var wDto in model.Workouts)
        {
            var workout = new TrainingWorkout(plan.Id, wDto.Name, wDto.Order, wDto.Description, wDto.Instructions);
            foreach (var iDto in wDto.Items)
                workout.Items.Add(new TrainingWorkoutItem(workout.Id, iDto.Name, iDto.Order, iDto.Description, iDto.Instructions, iDto.Sets, iDto.Repetitions));
            plan.Workouts.Add(workout);
        }

        return plan;
    }

    private static void ApplyPlanUpdate(TrainingPlan plan, UpdateTrainingPlanDto model)
    {
        plan.Update(model.Name, model.Description, model.Objective, model.Level, model.MinimumDurationDays, model.Instructions);

        // Atualiza / adiciona workouts e items
        foreach (var wDto in model.Workouts)
        {
            if (wDto.Id.HasValue)
            {
                var existing = plan.Workouts.FirstOrDefault(w => w.Id == wDto.Id.Value);
                if (existing is not null)
                {
                    existing.Update(wDto.Name, wDto.Order, wDto.Description, wDto.Instructions);

                    foreach (var iDto in wDto.Items)
                    {
                        if (iDto.Id.HasValue)
                        {
                            var existingItem = existing.Items.FirstOrDefault(i => i.Id == iDto.Id.Value);
                            existingItem?.Update(iDto.Name, iDto.Order, iDto.Description, iDto.Instructions, iDto.Sets, iDto.Repetitions);
                        }
                        else
                        {
                            existing.Items.Add(new TrainingWorkoutItem(existing.Id, iDto.Name, iDto.Order, iDto.Description, iDto.Instructions, iDto.Sets, iDto.Repetitions));
                        }
                    }
                }
            }
            else
            {
                var workout = new TrainingWorkout(plan.Id, wDto.Name, wDto.Order, wDto.Description, wDto.Instructions);
                foreach (var iDto in wDto.Items)
                    workout.Items.Add(new TrainingWorkoutItem(workout.Id, iDto.Name, iDto.Order, iDto.Description, iDto.Instructions, iDto.Sets, iDto.Repetitions));
                plan.Workouts.Add(workout);
            }
        }
    }

    private async Task RecalculateDailyLog(Guid userTrainingPlanId, Guid workoutId, TrainingWorkout workout, DateTime date, CancellationToken ct)
    {
        var activeItemCount = workout.Items.Count(i => i.Status == EntityStatus.Active);
        if (activeItemCount == 0) return;

        var completedItems = await userTrainingProgressRepository.GetByPlanAndWorkoutAndDate(userTrainingPlanId, workoutId, date, ct);
        // +1 porque o item atual ainda não foi salvo quando chamamos este método
        var completedCount = completedItems.Count() + 1;
        var percentage = Math.Min(100m, Math.Round((decimal)completedCount / activeItemCount * 100, 2));

        var log = await userTrainingWorkoutDailyLogRepository.GetByPlanWorkoutAndDate(userTrainingPlanId, workoutId, date, ct);
        if (log is null)
        {
            log = new UserTrainingWorkoutDailyLog(userTrainingPlanId, workoutId, date, percentage);
            userTrainingWorkoutDailyLogRepository.Add(log);
        }
        else
        {
            log.UpdateProgress(percentage);
            userTrainingWorkoutDailyLogRepository.Update(log);
        }
    }

    /// <summary>
    /// Regra de conclusão automática do plano:
    /// O plano é concluído quando o usuário atingiu ao menos MinimumDurationDays de treino
    /// (dias distintos com ao menos um item completado) E todos os treinos de pelo menos
    /// um ciclo completo (todos os treinos do plano foram realizados pelo menos uma vez).
    /// </summary>
    private async Task TryCompleteUserTrainingPlan(UserTrainingPlan utp, CancellationToken ct)
    {
        if (!utp.IsActive()) return;

        var allProgresses = await userTrainingProgressRepository.GetByUserTrainingPlan(utp.Id, ct);

        var distinctDays = allProgresses.Select(p => p.ProgressDate.Date).Distinct().Count();
        if (distinctDays < utp.TrainingPlan?.MinimumDurationDays) return;

        var planWorkoutIds = utp.TrainingPlan?.Workouts
            .Where(w => w.Status == EntityStatus.Active)
            .Select(w => w.Id)
            .ToHashSet() ?? [];

        var completedWorkoutIds = allProgresses
            .Select(p => p.TrainingWorkoutId)
            .Distinct()
            .ToHashSet();

        if (!planWorkoutIds.IsSubsetOf(completedWorkoutIds) || planWorkoutIds.Count == 0) return;

        utp.Complete();
        userTrainingPlanRepository.Update(utp);
        await userTrainingPlanRepository.SaveChanges(ct);
    }
}
