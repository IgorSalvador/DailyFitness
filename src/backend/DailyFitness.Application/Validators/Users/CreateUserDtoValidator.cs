using DailyFitness.Application.Dtos.Users;
using FluentValidation;

namespace DailyFitness.Application.Validators.User;

public class CreateUserDtoValidator : AbstractValidator<CreateUserDto>
{
    public CreateUserDtoValidator()
    {
        RuleFor(x => x.Firstname)
            .NotEmpty().WithMessage("O primeiro nome é obrigatório.")
            .MaximumLength(255).WithMessage("O primeiro nome deve ter no máximo 255 caracteres.");

        RuleFor(x => x.Surname)
            .NotEmpty().WithMessage("O sobrenome é obrigatório.")
            .MaximumLength(255).WithMessage("O sobrenome deve ter no máximo 255 caracteres.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("O e-mail é obrigatório.")
            .MaximumLength(255).WithMessage("O e-mail deve ter no máximo 255 caracteres.")
            .EmailAddress().WithMessage("O e-mail informado é inválido.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("A senha é obrigatória.")
            .MinimumLength(8).WithMessage("A senha deve ter no mínimo 8 caracteres.")
            .MaximumLength(255).WithMessage("A senha deve ter no máximo 255 caracteres.")
            .Matches(@"[A-Z]").WithMessage("A senha deve conter ao menos uma letra maiúscula.")
            .Matches(@"[a-z]").WithMessage("A senha deve conter ao menos uma letra minúscula.")
            .Matches(@"\d").WithMessage("A senha deve conter ao menos um número.");

        RuleFor(x => x.ConfirmPassword)
            .NotEmpty().WithMessage("A confirmação de senha é obrigatória.")
            .Equal(x => x.Password).WithMessage("A confirmação de senha deve ser igual à senha.");
    }
}
