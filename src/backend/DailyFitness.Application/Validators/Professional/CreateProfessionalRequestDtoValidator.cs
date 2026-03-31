using DailyFitness.Application.Dtos.Professional;
using FluentValidation;

namespace DailyFitness.Application.Validators.Professional;

public class CreateProfessionalRequestDtoValidator : AbstractValidator<CreateProfessionalRequestDto>
{
    public CreateProfessionalRequestDtoValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("O usuário é obrigatório.");

        RuleFor(x => x.Biography)
            .NotEmpty().WithMessage("A biografia é obrigatória.")
            .MaximumLength(6000).WithMessage("A biografia deve ter no máximo 6000 caracteres.");

        RuleFor(x => x.Skills)
            .Cascade(CascadeMode.Stop)
            .NotNull().WithMessage("As skills são obrigatórias.")
            .NotEmpty().WithMessage("Informe ao menos uma skill.")
            .Must(skills => skills.Count <= 10).WithMessage("São permitidas no máximo 10 skills.");

        RuleFor(x => x.Specialization)
            .NotEmpty().WithMessage("A especialização é obrigatória.")
            .MaximumLength(5000).WithMessage("A especialização deve ter no máximo 5000 caracteres.");
    }
}
