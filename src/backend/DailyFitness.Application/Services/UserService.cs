using DailyFitness.Application.Common.Results;
using DailyFitness.Application.Dtos.Authentication;
using DailyFitness.Application.Dtos.Users;
using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Application.Interfaces.Security;
using DailyFitness.Application.Interfaces.Services;
using DailyFitness.Application.Validators.Authentication;
using DailyFitness.Application.Validators.User;
using FluentValidation;
using ValidationResult = FluentValidation.Results.ValidationResult;

namespace DailyFitness.Application.Services;

public class UserService(IUserRepository userRepository, IPasswordHasherService passwordHasherService, IJwtService jwtService)
    : IUserService
{
    public async Task<ResultsDto<UserDto>> RegisterUser(CreateUserDto model, CancellationToken cancellationToken)
    {
        var validationResult = ExecuteValidation(new CreateUserDtoValidator(), model);

        if (!validationResult.IsValid)
            return ResultsDto<UserDto>.Fail("Falha de validação", validationResult.Errors.Select(x => x.ErrorMessage).ToList());

        if (await userRepository.GetIfAlreadyExist(model.Email, cancellationToken))
            return ResultsDto<UserDto>.Fail("Falha de registro", ["E-mail já cadastrado"]);

        var hashedPassword = passwordHasherService.HashPassword(model.Password);
        model.Password = hashedPassword;
        var user = model.ToEntity();

        userRepository.Add(user);
        await userRepository.SaveChanges(cancellationToken);

        return ResultsDto<UserDto>.Ok(UserDto.FromEntity(user));
    }

    public async Task<ResultsDto<LoginResultDto>> Authenticate(LoginDto model, CancellationToken cancellationToken)
    {
        var validationResult = ExecuteValidation(new LoginDtoValidator(), model);

        if(!validationResult.IsValid)
            return ResultsDto<LoginResultDto>.Fail("Falha de autenticação", validationResult.Errors.Select(x => x.ErrorMessage).ToList());

        var user = await userRepository.GetByEmail(model.Email, cancellationToken);

        if(user == null || !passwordHasherService.VerifyPassword(model.Password, user.PasswordHash))
            return ResultsDto<LoginResultDto>.Fail("Falha de autenticação", ["E-mail ou senha inválidos"]);

        var token = jwtService.GenerateToken(user);

        return ResultsDto<LoginResultDto>.Ok(new LoginResultDto(token, DateTime.Now.AddMinutes(30)));
    }

    private ValidationResult ExecuteValidation<TV, TE>(TV validation, TE entity) where TV : AbstractValidator<TE> where TE : class => validation.Validate(entity);
}
