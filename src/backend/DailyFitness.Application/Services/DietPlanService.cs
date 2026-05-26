using DailyFitness.Application.Common.Results;
using DailyFitness.Application.Dtos.DietPlan;
using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Application.Interfaces.Services;
using DailyFitness.Application.Validators.DietPlan;
using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Services;

public class DietPlanService(
    IDietPlanRepository dietPlanRepository,
    IUserDietPlanRepository userDietPlanRepository,
    IUserDietProgressRepository userDietProgressRepository,
    IUserDietMealDailyLogRepository userDietMealDailyLogRepository) : BaseService, IDietPlanService
{
    // ── Admin ─────────────────────────────────────────────────────────────────

    public async Task<ResultDto<IEnumerable<DietPlanDto>>> GetAllPlans(CancellationToken ct)
    {
        var plans = await dietPlanRepository.GetAllWithMealsAsync(ct);
        return ResultDto<IEnumerable<DietPlanDto>>.Ok(plans.Select(p => DietPlanDto.FromEntity(p, true)));
    }

    public async Task<ResultDto<DietPlanDto>> GetPlan(Guid id, CancellationToken ct)
    {
        var plan = await dietPlanRepository.GetByIdWithMealsAsync(id, ct);
        return plan is not null
            ? ResultDto<DietPlanDto>.Ok(DietPlanDto.FromEntity(plan, true))
            : ResultDto<DietPlanDto>.Fail("Plano alimentar não encontrado.");
    }

    public async Task<ResultDto<DietPlanDto>> CreatePlan(CreateDietPlanDto model, Guid creatorId, CancellationToken ct)
    {
        var validation = ExecuteValidation(new CreateDietPlanDtoValidator(), model);
        if (!validation.IsValid)
            return ResultDto<DietPlanDto>.Fail("Falha de validação", validation.Errors.Select(x => x.ErrorMessage).ToList());

        var plan = BuildPlanFromCreate(model, creatorId);

        dietPlanRepository.Add(plan);
        await dietPlanRepository.SaveChanges(ct);

        var created = await dietPlanRepository.GetByIdWithMealsAsync(plan.Id, ct);
        return ResultDto<DietPlanDto>.Ok(DietPlanDto.FromEntity(created!, true), "Plano alimentar criado com sucesso!");
    }

    public async Task<ResultDto<DietPlanDto>> UpdatePlan(Guid id, UpdateDietPlanDto model, CancellationToken ct)
    {
        var validation = ExecuteValidation(new UpdateDietPlanDtoValidator(), model);
        if (!validation.IsValid)
            return ResultDto<DietPlanDto>.Fail("Falha de validação", validation.Errors.Select(x => x.ErrorMessage).ToList());

        var plan = await dietPlanRepository.GetByIdWithMealsAsync(id, ct);
        if (plan is null)
            return ResultDto<DietPlanDto>.Fail("Falha de validação", ["Plano alimentar não encontrado."]);

        ApplyPlanUpdate(plan, model);

        dietPlanRepository.Update(plan);
        await dietPlanRepository.SaveChanges(ct);

        var updated = await dietPlanRepository.GetByIdWithMealsAsync(plan.Id, ct);
        return ResultDto<DietPlanDto>.Ok(DietPlanDto.FromEntity(updated!, true), "Plano alimentar atualizado com sucesso!");
    }

    public async Task<ResultDto<DietPlanDto>> ActivatePlan(Guid id, CancellationToken ct)
    {
        var plan = await dietPlanRepository.Get(id, ct);
        if (plan is null)
            return ResultDto<DietPlanDto>.Fail("Falha de validação", ["Plano alimentar não encontrado."]);

        try { plan.SetAsActive(); }
        catch (InvalidOperationException ex) { return ResultDto<DietPlanDto>.Fail("Falha de validação", [ex.Message]); }

        dietPlanRepository.Update(plan);
        await dietPlanRepository.SaveChanges(ct);

        return ResultDto<DietPlanDto>.Ok(DietPlanDto.FromEntity(plan), "Plano ativado com sucesso!");
    }

    public async Task<ResultDto<DietPlanDto>> DeactivatePlan(Guid id, CancellationToken ct)
    {
        var plan = await dietPlanRepository.Get(id, ct);
        if (plan is null)
            return ResultDto<DietPlanDto>.Fail("Falha de validação", ["Plano alimentar não encontrado."]);

        try { plan.SetAsInactive(); }
        catch (InvalidOperationException ex) { return ResultDto<DietPlanDto>.Fail("Falha de validação", [ex.Message]); }

        dietPlanRepository.Update(plan);
        await dietPlanRepository.SaveChanges(ct);

        return ResultDto<DietPlanDto>.Ok(DietPlanDto.FromEntity(plan), "Plano inativado com sucesso!");
    }

    public async Task<ResultDto<IEnumerable<DietPlanSubscriberDto>>> GetPlanSubscribers(Guid planId, CancellationToken ct)
    {
        var plan = await dietPlanRepository.Get(planId, ct);
        if (plan is null)
            return ResultDto<IEnumerable<DietPlanSubscriberDto>>.Fail("Plano alimentar não encontrado.");

        var subscribers = await dietPlanRepository.GetSubscribersAsync(planId, ct);
        return ResultDto<IEnumerable<DietPlanSubscriberDto>>.Ok(subscribers.Select(DietPlanSubscriberDto.FromEntity));
    }

    public async Task<ResultDto<UserDietPlanDto>> GetSubscriberProgress(Guid planId, Guid userId, CancellationToken ct)
    {
        var userPlan = await userDietPlanRepository.GetSubscriberProgressAsync(planId, userId, ct);
        return userPlan is not null
            ? ResultDto<UserDietPlanDto>.Ok(UserDietPlanDto.FromEntity(userPlan, true))
            : ResultDto<UserDietPlanDto>.Fail("Assinatura não encontrada.");
    }

    // ── Professional ──────────────────────────────────────────────────────────

    public async Task<ResultDto<IEnumerable<DietPlanDto>>> GetManagedPlans(Guid creatorId, CancellationToken ct)
    {
        var plans = await dietPlanRepository.GetByCreatorAsync(creatorId, ct);
        return ResultDto<IEnumerable<DietPlanDto>>.Ok(plans.Select(p => DietPlanDto.FromEntity(p, true)));
    }

    public async Task<ResultDto<DietPlanDto>> GetManagedPlan(Guid id, Guid creatorId, CancellationToken ct)
    {
        var plan = await dietPlanRepository.GetByCreatorAndIdAsync(id, creatorId, ct);
        return plan is not null
            ? ResultDto<DietPlanDto>.Ok(DietPlanDto.FromEntity(plan, true))
            : ResultDto<DietPlanDto>.Fail("Plano não encontrado ou sem permissão de acesso.");
    }

    public async Task<ResultDto<DietPlanDto>> CreateManagedPlan(CreateDietPlanDto model, Guid creatorId, CancellationToken ct)
        => await CreatePlan(model, creatorId, ct);

    public async Task<ResultDto<DietPlanDto>> UpdateManagedPlan(Guid id, UpdateDietPlanDto model, Guid creatorId, CancellationToken ct)
    {
        var validation = ExecuteValidation(new UpdateDietPlanDtoValidator(), model);
        if (!validation.IsValid)
            return ResultDto<DietPlanDto>.Fail("Falha de validação", validation.Errors.Select(x => x.ErrorMessage).ToList());

        var plan = await dietPlanRepository.GetByCreatorAndIdAsync(id, creatorId, ct);
        if (plan is null)
            return ResultDto<DietPlanDto>.Fail("Falha de validação", ["Plano não encontrado ou sem permissão de acesso."]);

        ApplyPlanUpdate(plan, model);

        dietPlanRepository.Update(plan);
        await dietPlanRepository.SaveChanges(ct);

        var updated = await dietPlanRepository.GetByIdWithMealsAsync(plan.Id, ct);
        return ResultDto<DietPlanDto>.Ok(DietPlanDto.FromEntity(updated!, true), "Plano alimentar atualizado com sucesso!");
    }

    public async Task<ResultDto<DietPlanDto>> ActivateManagedPlan(Guid id, Guid creatorId, CancellationToken ct)
    {
        var plan = await dietPlanRepository.GetByCreatorAndIdAsync(id, creatorId, ct);
        if (plan is null)
            return ResultDto<DietPlanDto>.Fail("Falha de validação", ["Plano não encontrado ou sem permissão de acesso."]);

        try { plan.SetAsActive(); }
        catch (InvalidOperationException ex) { return ResultDto<DietPlanDto>.Fail("Falha de validação", [ex.Message]); }

        dietPlanRepository.Update(plan);
        await dietPlanRepository.SaveChanges(ct);

        return ResultDto<DietPlanDto>.Ok(DietPlanDto.FromEntity(plan), "Plano ativado com sucesso!");
    }

    public async Task<ResultDto<DietPlanDto>> DeactivateManagedPlan(Guid id, Guid creatorId, CancellationToken ct)
    {
        var plan = await dietPlanRepository.GetByCreatorAndIdAsync(id, creatorId, ct);
        if (plan is null)
            return ResultDto<DietPlanDto>.Fail("Falha de validação", ["Plano não encontrado ou sem permissão de acesso."]);

        try { plan.SetAsInactive(); }
        catch (InvalidOperationException ex) { return ResultDto<DietPlanDto>.Fail("Falha de validação", [ex.Message]); }

        dietPlanRepository.Update(plan);
        await dietPlanRepository.SaveChanges(ct);

        return ResultDto<DietPlanDto>.Ok(DietPlanDto.FromEntity(plan), "Plano inativado com sucesso!");
    }

    public async Task<ResultDto<IEnumerable<DietPlanSubscriberDto>>> GetManagedPlanSubscribers(Guid planId, Guid creatorId, CancellationToken ct)
    {
        var plan = await dietPlanRepository.GetByCreatorAndIdAsync(planId, creatorId, ct);
        if (plan is null)
            return ResultDto<IEnumerable<DietPlanSubscriberDto>>.Fail("Plano não encontrado ou sem permissão de acesso.");

        var subscribers = await dietPlanRepository.GetSubscribersAsync(planId, ct);
        return ResultDto<IEnumerable<DietPlanSubscriberDto>>.Ok(subscribers.Select(DietPlanSubscriberDto.FromEntity));
    }

    public async Task<ResultDto<UserDietPlanDto>> GetManagedSubscriberProgress(Guid planId, Guid userId, Guid creatorId, CancellationToken ct)
    {
        var plan = await dietPlanRepository.GetByCreatorAndIdAsync(planId, creatorId, ct);
        if (plan is null)
            return ResultDto<UserDietPlanDto>.Fail("Plano não encontrado ou sem permissão de acesso.");

        return await GetSubscriberProgress(planId, userId, ct);
    }

    // ── User ──────────────────────────────────────────────────────────────────

    public async Task<ResultDto<IEnumerable<DietPlanDto>>> GetAvailablePlans(EDietObjective? objective, EDietLevel? level, CancellationToken ct)
    {
        var plans = await dietPlanRepository.GetAvailablePlansAsync(objective, level, ct);
        return ResultDto<IEnumerable<DietPlanDto>>.Ok(plans.Select(p => DietPlanDto.FromEntity(p)));
    }

    public async Task<ResultDto<DietPlanDto>> GetPlanDetail(Guid id, CancellationToken ct)
    {
        var plan = await dietPlanRepository.GetByIdWithMealsAsync(id, ct);
        if (plan is null)
            return ResultDto<DietPlanDto>.Fail("Plano alimentar não encontrado.");

        if (!plan.IsAvailableForSubscription())
            return ResultDto<DietPlanDto>.Fail("Este plano alimentar não está disponível.");

        return ResultDto<DietPlanDto>.Ok(DietPlanDto.FromEntity(plan, true));
    }

    public async Task<ResultDto<UserDietPlanDto>> SubscribePlan(Guid planId, Guid userId, CancellationToken ct)
    {
        var existing = await userDietPlanRepository.GetActiveByUserIdAsync(userId, ct);
        if (existing is not null)
            return ResultDto<UserDietPlanDto>.Fail("Falha de validação", ["Você já possui um plano alimentar ativo. Cancele o atual antes de assinar outro."]);

        var plan = await dietPlanRepository.Get(planId, ct);
        if (plan is null)
            return ResultDto<UserDietPlanDto>.Fail("Falha de validação", ["Plano alimentar não encontrado."]);

        if (!plan.IsAvailableForSubscription())
            return ResultDto<UserDietPlanDto>.Fail("Falha de validação", ["Este plano alimentar não está disponível para assinatura."]);

        var udp = new UserDietPlan(userId, planId);
        userDietPlanRepository.Add(udp);
        await userDietPlanRepository.SaveChanges(ct);

        var created = await userDietPlanRepository.GetByIdWithDetailsAsync(udp.Id, ct);
        return ResultDto<UserDietPlanDto>.Ok(UserDietPlanDto.FromEntity(created!), "Assinatura realizada com sucesso!");
    }

    public async Task<ResultDto<UserDietPlanDto>> CancelSubscription(Guid userId, CancelDietPlanDto model, CancellationToken ct)
    {
        var udp = await userDietPlanRepository.GetActiveByUserIdAsync(userId, ct);
        if (udp is null)
            return ResultDto<UserDietPlanDto>.Fail("Falha de validação", ["Você não possui um plano alimentar ativo."]);

        udp.Cancel(model.Reason);
        userDietPlanRepository.Update(udp);
        await userDietPlanRepository.SaveChanges(ct);

        return ResultDto<UserDietPlanDto>.Ok(UserDietPlanDto.FromEntity(udp), "Assinatura cancelada com sucesso.");
    }

    public async Task<ResultDto<UserDietPlanDto>> GetCurrentPlan(Guid userId, CancellationToken ct)
    {
        var udp = await userDietPlanRepository.GetActiveByUserIdAsync(userId, ct);
        if (udp is null)
            return ResultDto<UserDietPlanDto>.Fail("Você não possui um plano alimentar ativo.");

        var full = await userDietPlanRepository.GetByIdWithDetailsAsync(udp.Id, ct);
        return ResultDto<UserDietPlanDto>.Ok(UserDietPlanDto.FromEntity(full!, true));
    }

    public async Task<ResultDto<UserDietPlanDto>> GetCurrentPlanProgress(Guid userId, CancellationToken ct)
        => await GetCurrentPlan(userId, ct);

    public async Task<ResultDto<UserDietPlanDto>> MarkItemProgress(Guid userId, Guid mealId, Guid itemId, MarkDietItemProgressDto model, CancellationToken ct)
    {
        var udp = await userDietPlanRepository.GetActiveByUserIdAsync(userId, ct);
        if (udp is null)
            return ResultDto<UserDietPlanDto>.Fail("Falha de validação", ["Você não possui um plano alimentar ativo."]);

        if (!udp.IsActive())
            return ResultDto<UserDietPlanDto>.Fail("Falha de validação", ["Não é possível registrar progresso em um plano inativo."]);

        // Valida que a refeição e o item pertencem ao plano ativo
        var meal = udp.DietPlan?.Meals.FirstOrDefault(m => m.Id == mealId);
        if (meal is null)
            return ResultDto<UserDietPlanDto>.Fail("Falha de validação", ["Refeição não encontrada neste plano."]);

        var item = meal.Items.FirstOrDefault(i => i.Id == itemId);
        if (item is null)
            return ResultDto<UserDietPlanDto>.Fail("Falha de validação", ["Item não encontrado nesta refeição."]);

        var today = model.ProgressDate ?? DateOnly.FromDateTime(DateTime.Now);

        // Upsert do progresso
        var existing = await userDietProgressRepository.GetByKeyAsync(udp.Id, itemId, today, ct);
        if (existing is null)
        {
            var progress = new UserDietProgress(udp.Id, mealId, itemId, today);
            if (model.IsCompleted) progress.MarkAsCompleted();
            userDietProgressRepository.Add(progress);
        }
        else
        {
            if (model.IsCompleted) existing.MarkAsCompleted();
            else existing.MarkAsIncomplete();
            userDietProgressRepository.Update(existing);
        }

        // Salva o progresso antes de recalcular (sem offset)
        await userDietProgressRepository.SaveChanges(ct);

        // Recalcula o daily log da refeição
        await RecalculateDailyLog(udp.Id, mealId, meal.Items.Count, today, ct);

        // Verifica conclusão automática do plano
        await TryCompleteUserDietPlan(udp, ct);

        var full = await userDietPlanRepository.GetByIdWithDetailsAsync(udp.Id, ct);
        return ResultDto<UserDietPlanDto>.Ok(UserDietPlanDto.FromEntity(full!, true), "Progresso registrado com sucesso!");
    }

    public async Task<ResultDto<UserDietMealDailyLogDto>> FinishMealDay(Guid userId, Guid mealId, DateOnly? progressDate, CancellationToken ct)
    {
        var udp = await userDietPlanRepository.GetActiveByUserIdAsync(userId, ct);
        if (udp is null)
            return ResultDto<UserDietMealDailyLogDto>.Fail("Falha de validação", ["Você não possui um plano alimentar ativo."]);

        var meal = udp.DietPlan?.Meals.FirstOrDefault(m => m.Id == mealId);
        if (meal is null)
            return ResultDto<UserDietMealDailyLogDto>.Fail("Falha de validação", ["Refeição não encontrada neste plano."]);

        var today = progressDate ?? DateOnly.FromDateTime(DateTime.Now);
        await RecalculateDailyLog(udp.Id, mealId, meal.Items.Count, today, ct);
        await TryCompleteUserDietPlan(udp, ct);

        var log = await userDietMealDailyLogRepository.GetByKeyAsync(udp.Id, mealId, today, ct);
        if (log is null)
            return ResultDto<UserDietMealDailyLogDto>.Fail("Nenhum progresso registrado hoje para esta refeição.");

        return ResultDto<UserDietMealDailyLogDto>.Ok(UserDietMealDailyLogDto.FromEntity(log), "Refeição do dia finalizada!");
    }

    public async Task<ResultDto<IEnumerable<UserDietPlanDto>>> GetHistory(Guid userId, CancellationToken ct)
    {
        var records = await userDietPlanRepository.GetHistoryByUserIdAsync(userId, ct);
        return ResultDto<IEnumerable<UserDietPlanDto>>.Ok(records.Select(r => UserDietPlanDto.FromEntity(r)));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private static DietPlan BuildPlanFromCreate(CreateDietPlanDto model, Guid creatorId)
    {
        var plan = new DietPlan(
            model.Name, model.Description, model.Objective,
            model.Level, model.MinimumDurationDays, model.Instructions, creatorId);

        foreach (var mealDto in model.Meals)
        {
            var meal = new DietMeal(plan.Id, mealDto.Name, mealDto.Description, mealDto.Period, mealDto.Order, mealDto.Instructions);
            foreach (var itemDto in mealDto.Items)
            {
                meal.Items.Add(new DietMealItem(
                    meal.Id, itemDto.Name, itemDto.Description,
                    itemDto.Quantity, itemDto.Unit, itemDto.Order,
                    itemDto.Instructions, itemDto.Calories, itemDto.Protein,
                    itemDto.Carbohydrates, itemDto.Fat));
            }
            plan.Meals.Add(meal);
        }

        return plan;
    }

    private static void ApplyPlanUpdate(DietPlan plan, UpdateDietPlanDto model)
    {
        plan.Update(model.Name, model.Description, model.Objective, model.Level, model.MinimumDurationDays, model.Instructions);

        foreach (var mealDto in model.Meals)
        {
            if (mealDto.Id.HasValue)
            {
                var existing = plan.Meals.FirstOrDefault(m => m.Id == mealDto.Id.Value);
                if (existing is not null)
                {
                    existing.Update(mealDto.Name, mealDto.Description, mealDto.Period, mealDto.Order, mealDto.Instructions);

                    foreach (var itemDto in mealDto.Items)
                    {
                        if (itemDto.Id.HasValue)
                        {
                            var existingItem = existing.Items.FirstOrDefault(i => i.Id == itemDto.Id.Value);
                            existingItem?.Update(
                                itemDto.Name, itemDto.Description,
                                itemDto.Quantity, itemDto.Unit, itemDto.Order,
                                itemDto.Instructions, itemDto.Calories, itemDto.Protein,
                                itemDto.Carbohydrates, itemDto.Fat);
                        }
                        else
                        {
                            existing.Items.Add(new DietMealItem(
                                existing.Id, itemDto.Name, itemDto.Description,
                                itemDto.Quantity, itemDto.Unit, itemDto.Order,
                                itemDto.Instructions, itemDto.Calories, itemDto.Protein,
                                itemDto.Carbohydrates, itemDto.Fat));
                        }
                    }
                    continue;
                }
            }

            var newMeal = new DietMeal(plan.Id, mealDto.Name, mealDto.Description, mealDto.Period, mealDto.Order, mealDto.Instructions);
            foreach (var itemDto in mealDto.Items)
            {
                newMeal.Items.Add(new DietMealItem(
                    newMeal.Id, itemDto.Name, itemDto.Description,
                    itemDto.Quantity, itemDto.Unit, itemDto.Order,
                    itemDto.Instructions, itemDto.Calories, itemDto.Protein,
                    itemDto.Carbohydrates, itemDto.Fat));
            }
            plan.Meals.Add(newMeal);
        }
    }

    private async Task RecalculateDailyLog(Guid userDietPlanId, Guid mealId, int totalItems, DateOnly date, CancellationToken ct)
    {
        if (totalItems == 0) return;

        var progresses = await userDietProgressRepository.GetByMealAndDateAsync(userDietPlanId, mealId, date, ct);
        var completedCount = progresses.Count(p => p.IsCompleted);

        var log = await userDietMealDailyLogRepository.GetByKeyAsync(userDietPlanId, mealId, date, ct);
        if (log is null)
        {
            log = new UserDietMealDailyLog(userDietPlanId, mealId, date, totalItems, completedCount);
            userDietMealDailyLogRepository.Add(log);
        }
        else
        {
            log.Update(totalItems, completedCount);
            userDietMealDailyLogRepository.Update(log);
        }

        await userDietMealDailyLogRepository.SaveChanges(ct);
    }

    /// <summary>
    /// Regra de conclusão automática:
    /// O plano é concluído quando o usuário atingiu ao menos MinimumDurationDays de progresso
    /// (dias distintos com ao menos um item registrado) E todas as refeições do plano foram
    /// realizadas pelo menos uma vez.
    /// </summary>
    private async Task TryCompleteUserDietPlan(UserDietPlan udp, CancellationToken ct)
    {
        if (!udp.IsActive()) return;

        var allProgresses = await userDietProgressRepository.GetByPlanAsync(udp.Id, ct);

        var distinctDays = allProgresses.Select(p => p.ProgressDate).Distinct().Count();
        if (distinctDays < udp.DietPlan?.MinimumDurationDays) return;

        var planMealIds = udp.DietPlan?.Meals
            .Select(m => m.Id)
            .ToHashSet() ?? [];

        var coveredMealIds = allProgresses
            .Select(p => p.DietMealId)
            .Distinct()
            .ToHashSet();

        if (!planMealIds.IsSubsetOf(coveredMealIds) || planMealIds.Count == 0) return;

        udp.Complete();
        userDietPlanRepository.Update(udp);
        await userDietPlanRepository.SaveChanges(ct);
    }
}
