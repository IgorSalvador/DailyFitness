using DailyFitness.Application.Dtos.DietPlan;
using FluentValidation;

namespace DailyFitness.Application.Validators.DietPlan;

public class CreateDietPlanDtoValidator : AbstractValidator<CreateDietPlanDto>
{
    public CreateDietPlanDtoValidator()
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

public class CreateDietMealDtoValidator : AbstractValidator<CreateDietMealDto>
{
    public CreateDietMealDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("O nome da refeição é obrigatório.")
            .MaximumLength(150).WithMessage("O nome da refeição deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Period)
            .IsInEnum().WithMessage("O período da refeição é inválido.");

        RuleFor(x => x.Order)
            .GreaterThan(0).WithMessage("A ordem da refeição deve ser maior que zero.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Cada refeição deve conter ao menos um item.");

        RuleForEach(x => x.Items).SetValidator(new CreateDietMealItemDtoValidator());
    }
}

public class CreateDietMealItemDtoValidator : AbstractValidator<CreateDietMealItemDto>
{
    public CreateDietMealItemDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("O nome do item é obrigatório.")
            .MaximumLength(150).WithMessage("O nome do item deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("A quantidade deve ser maior que zero.");

        RuleFor(x => x.Unit)
            .NotEmpty().WithMessage("A unidade de medida é obrigatória.")
            .MaximumLength(30).WithMessage("A unidade deve ter no máximo 30 caracteres.");

        RuleFor(x => x.Order)
            .GreaterThan(0).WithMessage("A ordem do item deve ser maior que zero.");
    }
}
