using DailyFitness.Application.Dtos.TrainingPlan;
using FluentValidation;

namespace DailyFitness.Application.Validators.TrainingPlan;

public class UpdateTrainingPlanDtoValidator : AbstractValidator<UpdateTrainingPlanDto>
{
    public UpdateTrainingPlanDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("O nome do plano é obrigatório.")
            .MinimumLength(3).WithMessage("O nome deve ter no mínimo 3 caracteres.")
            .MaximumLength(150).WithMessage("O nome deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("A descrição é obrigatória.")
            .MaximumLength(4000).WithMessage("A descrição deve ter no máximo 4000 caracteres.");

        RuleFor(x => x.Objective)
            .IsInEnum().WithMessage("O objetivo do plano é inválido.");

        RuleFor(x => x.Level)
            .IsInEnum().WithMessage("O nível do plano é inválido.");

        RuleFor(x => x.MinimumDurationDays)
            .GreaterThan(0).WithMessage("A duração mínima deve ser maior que zero.");

        RuleFor(x => x.Workouts)
            .NotEmpty().WithMessage("O plano deve conter ao menos um treino.");

        RuleForEach(x => x.Workouts).SetValidator(new UpsertTrainingWorkoutDtoValidator());
    }
}

public class UpsertTrainingWorkoutDtoValidator : AbstractValidator<UpsertTrainingWorkoutDto>
{
    public UpsertTrainingWorkoutDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("O nome do treino é obrigatório.")
            .MaximumLength(150).WithMessage("O nome do treino deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Order)
            .GreaterThan(0).WithMessage("A ordem do treino deve ser maior que zero.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Cada treino deve conter ao menos um exercício.");

        RuleForEach(x => x.Items).SetValidator(new UpsertTrainingWorkoutItemDtoValidator());
    }
}

public class UpsertTrainingWorkoutItemDtoValidator : AbstractValidator<UpsertTrainingWorkoutItemDto>
{
    public UpsertTrainingWorkoutItemDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("O nome do exercício é obrigatório.")
            .MaximumLength(150).WithMessage("O nome do exercício deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Order)
            .GreaterThan(0).WithMessage("A ordem do exercício deve ser maior que zero.");

        RuleFor(x => x.Sets)
            .GreaterThan(0).WithMessage("O número de séries deve ser maior que zero.")
            .When(x => x.Sets.HasValue);

        RuleFor(x => x.Repetitions)
            .GreaterThan(0).WithMessage("O número de repetições deve ser maior que zero.")
            .When(x => x.Repetitions.HasValue);
    }
}
