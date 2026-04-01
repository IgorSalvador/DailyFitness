using DailyFitness.Application.Dtos.Professional;
using FluentValidation;

namespace DailyFitness.Application.Validators.Professional;

public class ProfessionalRequestEvaluationDtoValidator : AbstractValidator<ProfessionalRequestEvaluationDto>
{
    public ProfessionalRequestEvaluationDtoValidator()
    {
        RuleFor(x => x.ProfessionalRequestId)
            .NotEmpty().WithMessage("Id da Requisição é obrigatório.");

        RuleFor(x => x.IsApproved)
            .NotNull().WithMessage("É obrigatório informar o resultado da avaliação.");

        RuleFor(x => x.Comments)
            .MaximumLength(2000).WithMessage("Comentário não pode ter mais que 2000 caracteres.");

        RuleFor(x => x.Comments)
            .NotEmpty().WithMessage("Comentário é obrigatório quando a aprovação for reprovada.")
            .When(x => !x.IsApproved);
    }
}
