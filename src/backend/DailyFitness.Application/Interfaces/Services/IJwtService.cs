using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Interfaces.Services;

public interface IJwtService
{
    string GenerateToken(User user, bool rememberMe = false);
}
