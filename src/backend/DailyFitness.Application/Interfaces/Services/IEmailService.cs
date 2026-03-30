using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Interfaces.Services;

public interface IEmailService
{
    Task SendWelcomeEmail(string email, string firstName, CancellationToken ct);
    Task SendResetPasswordEmail(User user, string requestUrl, CancellationToken ct);
}
