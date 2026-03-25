using DailyFitness.Application.Common.Results;
using DailyFitness.Application.Dtos.Authentication;
using DailyFitness.Application.Dtos.Users;

namespace DailyFitness.Application.Interfaces.Services;

public interface IUserService
{
    Task<ResultsDto<UserDto>> RegisterUser(CreateUserDto user, CancellationToken cancellationToken);
    Task<ResultsDto<LoginResultDto>> Authenticate(LoginDto model, CancellationToken cancellationToken);
}
