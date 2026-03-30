using DailyFitness.Application.Common.Results;
using DailyFitness.Application.Dtos.Authentication;
using DailyFitness.Application.Dtos.Users;

namespace DailyFitness.Application.Interfaces.Services;

public interface IUserService
{
    Task<ResultDto<UserDto>> RegisterUser(CreateUserDto user, CancellationToken cancellationToken);
    Task<ResultDto<LoginResultDto>> Authenticate(LoginDto model, CancellationToken cancellationToken);
    Task<ResultDto<string>> ResetPasswordRequest(ResetUserPasswordRequestDto model, string frontendUrl, CancellationToken cancellationToken);
}
