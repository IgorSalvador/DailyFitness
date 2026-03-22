using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Interfaces.Security;

public interface IPasswordHasherService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
}
