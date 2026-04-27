using DailyFitness.Application.Dtos.Challenge;
using FluentValidation;

namespace DailyFitness.Application.Validators.Challenge;

public class UpdateChallengeProgressDtoValidator : AbstractValidator<UpdateChallengeProgressDto>
{
    public UpdateChallengeProgressDtoValidator()
    {
        RuleFor(x => x.ProgressValue)
            .GreaterThan(0).WithMessage("O valor do progresso deve ser maior que zero.");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("As notas devem ter no máximo 500 caracteres.")
            .When(x => x.Notes is not null);
    }
}
