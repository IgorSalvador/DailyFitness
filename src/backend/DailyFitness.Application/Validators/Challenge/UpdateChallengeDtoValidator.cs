using DailyFitness.Application.Dtos.Challenge;
using FluentValidation;

namespace DailyFitness.Application.Validators.Challenge;

public class UpdateChallengeDtoValidator : AbstractValidator<UpdateChallengeDto>
{
    public UpdateChallengeDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("O nome é obrigatório.")
            .MinimumLength(5).WithMessage("O nome deve ter no mínimo 5 caracteres.")
            .MaximumLength(100).WithMessage("O nome deve ter no máximo 100 caracteres.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("A descrição é obrigatória.")
            .MinimumLength(50).WithMessage("A descrição deve ter no mínimo 50 caracteres.")
            .MaximumLength(4000).WithMessage("A descrição deve ter no máximo 4000 caracteres.");

        RuleFor(x => x.ExpectedEndDate)
            .NotEmpty().WithMessage("A data limite é obrigatória.")
            .GreaterThan(DateTime.Now).WithMessage("A data limite não pode ser anterior à data atual.");

        When(x => x.Type.HasValue, () =>
        {
            RuleFor(x => x.Type!.Value)
                .IsInEnum().WithMessage("O tipo do desafio é inválido.");
        });

        When(x => x.ChallengeStatus.HasValue, () =>
        {
            RuleFor(x => x.ChallengeStatus!.Value)
                .IsInEnum().WithMessage("O status do desafio é inválido.");
        });
    }
}
