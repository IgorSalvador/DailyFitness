using DailyFitness.Application.Dtos.Challenge;
using DailyFitness.Domain.ValueObjects;
using FluentValidation;

namespace DailyFitness.Application.Validators.Challenge;

public class CreateChallengeDtoValidator : AbstractValidator<CreateChallengeDto>
{
    public CreateChallengeDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("O nome é obrigatório.")
            .MinimumLength(5).WithMessage("O nome deve ter no mínimo 5 caracteres.")
            .MaximumLength(100).WithMessage("O nome deve ter no máximo 100 caracteres.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("A descrição é obrigatória.")
            .MinimumLength(50).WithMessage("A descrição deve ter no mínimo 50 caracteres.")
            .MaximumLength(4000).WithMessage("A descrição deve ter no máximo 4000 caracteres.");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("O tipo do desafio é inválido.");

        RuleFor(x => x.ExpectedEndDate)
            .NotEmpty().WithMessage("A data limite é obrigatória.")
            .GreaterThan(DateTime.Now).WithMessage("A data limite não pode ser anterior à data atual.");
    }
}
