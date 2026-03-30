using DailyFitness.Application.Common.Results;
using DailyFitness.Application.Dtos.Authentication;
using DailyFitness.Application.Dtos.Users;
using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Application.Interfaces.Security;
using DailyFitness.Application.Interfaces.Services;
using DailyFitness.Application.Validators.Authentication;
using DailyFitness.Application.Validators.Users;
using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Services;

public class UserService(
    IUserRepository userRepository,
    IPasswordHasherService passwordHasherService,
    IJwtService jwtService,
    IEmailService emailService)
    : BaseService, IUserService
{
    public async Task<ResultDto<UserDto>> RegisterUser(CreateUserDto model, CancellationToken cancellationToken)
    {
        var validationResult = ExecuteValidation(new CreateUserDtoValidator(), model);

        if (!validationResult.IsValid)
            return ResultDto<UserDto>.Fail("Falha de validação", validationResult.Errors.Select(x => x.ErrorMessage).ToList());

        if (await userRepository.GetIfAlreadyExist(model.Email, cancellationToken))
            return ResultDto<UserDto>.Fail("Falha de registro", ["E-mail já cadastrado"]);

        var hashedPassword = passwordHasherService.HashPassword(model.Password);
        model.Password = hashedPassword;
        var user = model.ToEntity();

        userRepository.Add(user);
        await userRepository.SaveChanges(cancellationToken);

        await emailService.SendWelcomeEmail(user.Email, user.FirstName, cancellationToken);

        return ResultDto<UserDto>.Ok(UserDto.FromEntity(user), "Registro realizado com sucesso!");
    }

    public async Task<ResultDto<LoginResultDto>> Authenticate(LoginDto model, CancellationToken cancellationToken)
    {
        var validationResult = ExecuteValidation(new LoginDtoValidator(), model);

        if(!validationResult.IsValid)
            return ResultDto<LoginResultDto>.Fail("Falha de autenticação", validationResult.Errors.Select(x => x.ErrorMessage).ToList());

        var user = await userRepository.GetByEmail(model.Email, cancellationToken);

        if(user == null || !passwordHasherService.VerifyPassword(model.Password, user.PasswordHash))
            return ResultDto<LoginResultDto>.Fail("Falha de autenticação", ["E-mail ou senha inválidos"]);

        var token = jwtService.GenerateToken(user, model.RememberMe);

        user.UpdateLastLoginAt();
        userRepository.Update(user);
        await userRepository.SaveChanges(cancellationToken);

        return ResultDto<LoginResultDto>.Ok(new LoginResultDto(token), "Login realizado com sucesso!");
    }

    public async Task<ResultDto<string>> ResetPasswordRequest(ResetUserPasswordRequestDto model,
        string frontendUrl, CancellationToken cancellationToken)
    {
        var validationResult = ExecuteValidation(new ResetUserPasswordRequestDtoValidator(), model);

        if(!validationResult.IsValid)
            return ResultDto<string>.Fail("Falha de validação", validationResult.Errors.Select(x => x.ErrorMessage).ToList());

        var user = await userRepository.GetByEmail(model.Email, cancellationToken);

        if(user == null)
            return ResultDto<string>.Fail("Falha de validação", ["Usuário não encontrado"]);

        await userRepository.CancelActiveResetPasswordRequest(user.Id, cancellationToken);

        var token = Guid.NewGuid().ToString();

        var request = new ResetPasswordRequest(token, user.Id);

        await userRepository.AddResetPasswordRequest(request, cancellationToken);

        await emailService.SendResetPasswordEmail(user,$"{frontendUrl}/account/reset-password?token={request.Token}", cancellationToken);

        return ResultDto<string>.Ok(request.Token, "Solicitação de redefinição de senha enviada com sucesso");
    }

    public async Task<ResultDto<UserDto>> ResetPassword(ResetUserPasswordDto model, CancellationToken cancellationToken)
    {
        var validationResult = ExecuteValidation(new ResetUserPasswordDtoValidator(), model);

        if(!validationResult.IsValid)
            return ResultDto<UserDto>.Fail("Falha de validação", validationResult.Errors.Select(x => x.ErrorMessage).ToList());

        var request = await userRepository.GetActiveResetPasswordRequestWithUserByToken(model.Token, cancellationToken);

        if(request == null || request.ValidUntil < DateTime.Now)
            return ResultDto<UserDto>.Fail("Falha de validação", ["Solicitação de redefinição de senha não encontrada!"]);

        var hashedPassword = passwordHasherService.HashPassword(model.Password);
        var user = await userRepository.Get(request.UserId, cancellationToken);

        if(user == null)
            return ResultDto<UserDto>.Fail("Falha de validação", ["Usuário não encontrado"]);

        user.UpdatePassword(hashedPassword);

        userRepository.Update(user);
        await userRepository.SaveChanges(cancellationToken);

        return ResultDto<UserDto>.Ok(UserDto.FromEntity(user), "Senha redefinida com sucesso");
    }
}
