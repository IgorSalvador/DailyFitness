namespace DailyFitness.Application.Interfaces.Services;

public interface IEmailService
{
    Task SendWelcomeEmail(string email, string firstName, CancellationToken ct);
}
