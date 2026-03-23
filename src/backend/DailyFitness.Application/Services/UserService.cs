using DailyFitness.Application.Common.Results;
using DailyFitness.Application.Dtos.Users;
using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Application.Interfaces.Security;
using DailyFitness.Application.Interfaces.Services;
using FluentValidation;

namespace DailyFitness.Application.Services;

public class UserService(IUserRepository userRepository, IPasswordHasherService passwordHasherService, IValidator<CreateUserDto> validator)
    : IUserService
{
    public async Task<ResultsDto<UserDto>> RegisterUser(CreateUserDto model, CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(model, cancellationToken);

        if (!validationResult.IsValid)
            return ResultsDto<UserDto>.Fail("Falha de validação", validationResult.Errors.Select(x => x.ErrorMessage).ToList());

        if (await userRepository.GetIfAlreadyExist(model.Email))
            return ResultsDto<UserDto>.Fail("Falha de registro", ["E-mail já cadastrado"]);

        var hashedPassword = passwordHasherService.HashPassword(model.Password);
        model.Password = hashedPassword;
        var user = model.ToEntity();

        userRepository.Add(user);
        await userRepository.SaveChanges();

        return ResultsDto<UserDto>.Ok(UserDto.FromEntity(user));
    }
}
