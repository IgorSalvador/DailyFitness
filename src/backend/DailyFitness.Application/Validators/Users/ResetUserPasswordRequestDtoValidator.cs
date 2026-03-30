using DailyFitness.Application.Dtos.Users;
using FluentValidation;

namespace DailyFitness.Application.Validators.Users;

public class ResetUserPasswordRequestDtoValidator : AbstractValidator<ResetUserPasswordRequestDto>
{
    public ResetUserPasswordRequestDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("O e-mail é obrigatório.")
            .MaximumLength(255).WithMessage("O e-mail deve ter no máximo 255 caracteres.")
            .EmailAddress().WithMessage("O e-mail informado é inválido.");
    }
}
