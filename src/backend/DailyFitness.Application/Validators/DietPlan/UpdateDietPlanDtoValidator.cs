using DailyFitness.Application.Dtos.DietPlan;
using FluentValidation;

namespace DailyFitness.Application.Validators.DietPlan;

public class UpdateDietPlanDtoValidator : AbstractValidator<UpdateDietPlanDto>
{
    public UpdateDietPlanDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("O nome do plano é obrigatório.")
            .MinimumLength(3).WithMessage("O nome deve ter no mínimo 3 caracteres.")
            .MaximumLength(150).WithMessage("O nome deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("A descrição é obrigatória.")
            .MaximumLength(1000).WithMessage("A descrição deve ter no máximo 1000 caracteres.");

        RuleFor(x => x.Objective)
            .IsInEnum().WithMessage("O objetivo do plano é inválido.");

        RuleFor(x => x.Level)
            .IsInEnum().WithMessage("O nível do plano é inválido.");

        RuleFor(x => x.MinimumDurationDays)
            .GreaterThan(0).WithMessage("A duração mínima deve ser maior que zero.");

        RuleFor(x => x.Instructions)
            .MaximumLength(2000).WithMessage("As instruções devem ter no máximo 2000 caracteres.")
            .When(x => x.Instructions is not null);

        RuleFor(x => x.Meals)
            .NotEmpty().WithMessage("O plano deve conter ao menos uma refeição.");

        RuleForEach(x => x.Meals).SetValidator(new CreateDietMealDtoValidator());
    }
}
