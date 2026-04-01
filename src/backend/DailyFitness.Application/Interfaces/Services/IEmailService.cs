using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Interfaces.Services;

public interface IEmailService
{
    Task SendWelcomeEmail(string email, string firstName, CancellationToken ct);
    Task SendResetPasswordEmail(User user, string requestUrl, CancellationToken ct);
    Task SendUserProfessionalRequestForAdministratorsEmail(List<string> administrators, CancellationToken ct);
    Task SendUserProfessionalRequestEmail(User user, CancellationToken ct);
    Task SendUserProfessionalRequestFeedbackEmail(ProfessionalRequest request, CancellationToken ct);
}
