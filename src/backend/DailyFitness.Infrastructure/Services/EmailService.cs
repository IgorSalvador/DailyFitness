using System.Net;
using System.Net.Mail;
using System.Text.Json;
using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Application.Interfaces.Services;
using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;
using Microsoft.Extensions.Configuration;

namespace DailyFitness.Infrastructure.Services;

public class EmailService(ILogEmailRepository logEmailRepository, IConfiguration configuration) : IEmailService
{
    private async Task Send(EEmailType emailType, string subject, List<string> recipients, string body, CancellationToken ct, MailPriority mailPriority = MailPriority.Normal)
    {
        var jsonRecipients = JsonSerializer.Serialize(recipients);
        var logEmail = new LogEmail(emailType, subject, jsonRecipients, body);

        try
        {
            var mailMessage = new MailMessage();

            foreach (var recipient in recipients)
                mailMessage.To.Add(recipient);

            mailMessage.From = new MailAddress(configuration["Email:Sender"]!, "DailyFitness");
            mailMessage.Subject = subject;
            mailMessage.Body = body;
            mailMessage.IsBodyHtml = true;
            mailMessage.Priority = mailPriority;
            mailMessage.DeliveryNotificationOptions = DeliveryNotificationOptions.OnFailure;

            var smtpClient = new SmtpClient();
            smtpClient.Host = configuration["Email:Host"]!;
            smtpClient.Port = int.Parse(configuration["Email:Port"]!);
            smtpClient.EnableSsl = true;
            smtpClient.DeliveryMethod = SmtpDeliveryMethod.Network;
            smtpClient.Credentials = new NetworkCredential(configuration["Email:UserName"]!, configuration["Email:Password"]!);

            await smtpClient.SendMailAsync(mailMessage, ct);

            logEmail.MarkAsSent();
        }
        catch (Exception ex)
        {
            logEmail.MarkAsFailed(ex.ToString());
        }
        finally
        {
            logEmailRepository.Add(logEmail);
            await logEmailRepository.SaveChanges(ct);
        }

    }
}
