using System.Net;
using System.Net.Mail;
using System.Text;
using System.Text.Json;
using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Application.Interfaces.Services;
using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;
using Microsoft.Extensions.Configuration;

namespace DailyFitness.Infrastructure.Services;

public class EmailService(ILogEmailRepository logEmailRepository, IConfiguration configuration) : IEmailService
{
    public async Task SendWelcomeEmail(string email, string firstName, CancellationToken ct)
    {
        const string subject = "Bem-vindo ao Daily Fitness!";

        var body = new StringBuilder();

        #region Body

        body.AppendLine("<p style=\"margin:0 0 16px 0;font-size:16px;line-height:24px;color:#111111;\">Olá!</p>");

        body.AppendLine("<p style=\"margin:0 0 16px 0;font-size:16px;line-height:24px;color:#111111;\">");
        body.AppendLine($"Seja bem-vindo ao <strong style=\"color:#5B21B6;\">Daily Fitness</strong> {firstName}!");
        body.AppendLine("</p>");

        body.AppendLine("<p style=\"margin:0 0 16px 0;font-size:16px;line-height:24px;color:#111111;\">");
        body.AppendLine(
            "Seu cadastro foi realizado com sucesso e agora você já pode começar sua jornada com mais organização, foco e consistência nos seus treinos.");
        body.AppendLine("</p>");

        body.AppendLine("<p style=\"margin:0 0 16px 0;font-size:16px;line-height:24px;color:#111111;\">");
        body.AppendLine(
            "Na plataforma, você poderá acompanhar sua rotina, estruturar seus objetivos e manter sua evolução sempre em dia.");
        body.AppendLine("</p>");

        body.AppendLine(
            "<div style=\"margin:24px 0;padding:16px;border-left:4px solid #FFD54A;background-color:#FFF8DB;border-radius:8px;\">");
        body.AppendLine("    <p style=\"margin:0;font-size:15px;line-height:22px;color:#111111;\">");
        body.AppendLine(
            "        <strong style=\"color:#5B21B6;\">Dica inicial:</strong> complete suas informações e organize seus primeiros passos para aproveitar melhor a experiência no aplicativo.");
        body.AppendLine("    </p>");
        body.AppendLine("</div>");

        body.AppendLine("<p style=\"margin:0 0 24px 0;font-size:16px;line-height:24px;color:#111111;\">");
        body.AppendLine("Estamos felizes em ter você com a gente nessa jornada.");
        body.AppendLine("</br>");

        body.AppendLine("<p style=\"margin:0;font-size:14px;line-height:22px;color:#4B5563;\">");
        body.AppendLine(
            "Conte com o <strong style=\"color:#5B21B6;\">Daily Fitness</strong> para apoiar sua evolução todos os dias.");
        body.AppendLine("</p>");

        #endregion

        var bodyHtml = BuildDefaultLayout(subject, body.ToString());

        await Send(EEmailType.WelcomeNotification, subject, [email], bodyHtml, ct);
    }

    public async Task SendResetPasswordEmail(User user, string requestUrl, CancellationToken ct)
    {
        const string subject = "Solicitação de redefinição de senha!";

        var body = new StringBuilder();

        #region Body

        body.AppendLine(
            $"<p style=\"margin:0 0 16px 0;font-size:16px;line-height:24px;color:#111111;\">Olá, {user.FirstName}!</p>");

        body.AppendLine("<p style=\"margin:0 0 16px 0;font-size:16px;line-height:24px;color:#111111;\">");
        body.AppendLine(
            "Recebemos uma solicitação para redefinir a sua senha no <strong style=\"color:#5B21B6;\">Daily Fitness</strong>.");
        body.AppendLine("</p>");

        body.AppendLine("<p style=\"margin:0 0 16px 0;font-size:16px;line-height:24px;color:#111111;\">");
        body.AppendLine("Para continuar com a alteração, clique no botão abaixo:");
        body.AppendLine("</p>");

        body.AppendLine("<div style=\"text-align:center;margin:24px 0;\">");
        body.AppendLine(
            $"    <a href=\"{requestUrl}\" style=\"display:inline-block;background-color:#5B21B6;color:#FFF;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:bold;font-size:14px;\">Redefinir senha</a>");
        body.AppendLine("</div>");

        body.AppendLine("<p style=\"margin:0 0 16px 0;font-size:15px;line-height:22px;color:#111111;\">");
        body.AppendLine("Caso o botão acima não funcione, copie e cole o link abaixo no seu navegador:");
        body.AppendLine("</p>");

        body.AppendLine(
            $"<p style=\"margin:0 0 24px 0;font-size:14px;line-height:22px;word-break:break-all;\"><a href=\"{requestUrl}\" style=\"color:#5B21B6;text-decoration:underline;\">{requestUrl}</a></p>");

        body.AppendLine(
            "<div style=\"margin:24px 0;padding:16px;border-left:4px solid #FFD54A;background-color:#FFF8DB;border-radius:8px;\">");
        body.AppendLine("    <p style=\"margin:0 0 8px 0;font-size:15px;line-height:22px;color:#111111;\">");
        body.AppendLine(
            "        <strong style=\"color:#5B21B6;\">Importante:</strong> por segurança, este link deve ser utilizado dentro do prazo configurado pelo sistema.");
        body.AppendLine("    </p>");
        body.AppendLine("    <p style=\"margin:0;font-size:15px;line-height:22px;color:#111111;\">");
        body.AppendLine(
            "        Se você não solicitou a redefinição de senha, ignore este e-mail. Nenhuma alteração será realizada automaticamente.");
        body.AppendLine("    </p>");
        body.AppendLine("</div>");

        body.AppendLine("<p style=\"margin:0;font-size:14px;line-height:22px;color:#4B5563;\">");
        body.AppendLine("Se necessário, solicite uma nova redefinição diretamente pela plataforma.");

        #endregion

        var bodyHtml = BuildDefaultLayout(subject, body.ToString());

        await Send(EEmailType.ResetPasswordNotification, subject, [user.Email], bodyHtml, ct);
    }

    public async Task SendUserProfessionalRequestForAdministratorsEmail(List<string> administrators, CancellationToken ct)
    {
        const string subject = "Solicitação de acesso como profissional fitness!";

        var body = new StringBuilder();

        #region Body

        body.AppendLine("<p style=\"margin:0 0 16px 0;font-size:16px;line-height:24px;color:#111111;\">Olá!</p>");

        body.AppendLine("<p style=\"margin:0 0 16px 0;font-size:16px;line-height:24px;color:#111111;\">");
        body.AppendLine(
            "Uma nova solicitação de acesso como <strong style=\"color:#5B21B6;\">profissional fitness</strong> foi realizada no <strong style=\"color:#5B21B6;\">Daily Fitness</strong>.");
        body.AppendLine("</p>");

        body.AppendLine("<p style=\"margin:0 0 16px 0;font-size:16px;line-height:24px;color:#111111;\">");
        body.AppendLine(
            "A solicitação está pendente de validação e requer análise administrativa para liberação ou rejeição do acesso.");
        body.AppendLine("</p>");

        body.AppendLine(
            "<div style=\"margin:24px 0;padding:16px;border-left:4px solid #FFD54A;background-color:#FFF8DB;border-radius:8px;\">");
        body.AppendLine("<p style=\"margin:0 0 8px 0;font-size:15px;line-height:22px;color:#111111;\">");
        body.AppendLine(
            "<strong style=\"color:#5B21B6;\">Ação necessária:</strong> acesse a plataforma para revisar os dados enviados pelo usuário e concluir a validação.");
        body.AppendLine("</p>");
        body.AppendLine("<p style=\"margin:0;font-size:15px;line-height:22px;color:#111111;\">");
        body.AppendLine("Enquanto não houver uma decisão, a solicitação permanecerá com o status pendente.");
        body.AppendLine("</p>");
        body.AppendLine("</div>");

        body.AppendLine("<p style=\"margin:0 0 16px 0;font-size:16px;line-height:24px;color:#111111;\">");
        body.AppendLine("Após a análise, o usuário deverá ser notificado conforme o resultado da validação.");
        body.AppendLine("</p>");

        body.AppendLine("<p style=\"margin:0 0 24px 0;font-size:16px;line-height:24px;color:#111111;\">");
        body.AppendLine(
            "Recomendamos que a verificação seja realizada o quanto antes para evitar atraso na liberação do acesso.");
        body.AppendLine("</p>");

        #endregion

        var bodyHtml = BuildDefaultLayout(subject, body.ToString());

        await Send(EEmailType.ProfessionalRequestAdminNotification, subject, administrators, bodyHtml, ct);
    }

    public async Task SendUserProfessionalRequestEmail(User user, CancellationToken ct)
    {
        const string subject = "Solicitação de acesso como profissional fitness!";

        var body = new StringBuilder();

        #region Body

        body.AppendLine("<p style=\"margin:0 0 16px 0;font-size:16px;line-height:24px;color:#111111;\">Olá!</p>");

        body.AppendLine("<p style=\"margin:0 0 16px 0;font-size:16px;line-height:24px;color:#111111;\">");
        body.AppendLine(
            "Recebemos sua solicitação de acesso como <strong style=\"color:#5B21B6;\">profissional fitness</strong> no <strong style=\"color:#5B21B6;\">Daily Fitness</strong>.");
        body.AppendLine("</p>");

        body.AppendLine("<p style=\"margin:0 0 16px 0;font-size:16px;line-height:24px;color:#111111;\">");
        body.AppendLine(
            "Seu pedido foi registrado com sucesso e agora seguirá para análise da administração da plataforma.");
        body.AppendLine("</p>");

        body.AppendLine("<p style=\"margin:0 0 16px 0;font-size:16px;line-height:24px;color:#111111;\">");
        body.AppendLine(
            "Após a validação, você poderá ter acesso aos recursos específicos destinados aos profissionais dentro do sistema.");
        body.AppendLine("</p>");

        body.AppendLine(
            "<div style=\"margin:24px 0;padding:16px;border-left:4px solid #FFD54A;background-color:#FFF8DB;border-radius:8px;\">");
        body.AppendLine("<p style=\"margin:0 0 8px 0;font-size:15px;line-height:22px;color:#111111;\">");
        body.AppendLine(
            "<strong style=\"color:#5B21B6;\">Importante:</strong> sua solicitação ficará com o status de pendente até que a equipe responsável realize a validação.");
        body.AppendLine("</p>");
        body.AppendLine("<p style=\"margin:0;font-size:15px;line-height:22px;color:#111111;\">");
        body.AppendLine(
            "Caso aprovado, seu perfil será atualizado conforme as permissões disponíveis para profissionais fitness.");
        body.AppendLine("</p>");
        body.AppendLine("</div>");

        body.AppendLine("<p style=\"margin:0 0 24px 0;font-size:16px;line-height:24px;color:#111111;\">");
        body.AppendLine(
            "Assim que houver uma atualização sobre a sua solicitação, você será notificado pela plataforma.");
        body.AppendLine("</p>");

        body.AppendLine("<p style=\"margin:0;font-size:14px;line-height:22px;color:#4B5563;\">");
        body.AppendLine(
            "Agradecemos o seu interesse em fazer parte do <strong style=\"color:#5B21B6;\">Daily Fitness</strong> como profissional.");
        body.AppendLine("</p>");

        #endregion

        var bodyHtml = BuildDefaultLayout(subject, body.ToString());

        await Send(EEmailType.UserProfessionalRequestNotification, subject, [user.Email], bodyHtml, ct);
    }

    private async Task Send(EEmailType emailType, string subject, List<string> recipients, string body,
        CancellationToken ct, MailPriority mailPriority = MailPriority.Normal, List<string>? ccRecipients = null)
    {
        var jsonRecipients = JsonSerializer.Serialize(recipients);
        var logEmail = new LogEmail(emailType, subject, jsonRecipients, body);

        try
        {
            var mailMessage = new MailMessage();

            foreach (var recipient in recipients)
                mailMessage.To.Add(recipient);

            if (ccRecipients != null)
            {
                foreach (var ccRecipient in ccRecipients)
                    mailMessage.CC.Add(ccRecipient);
            }

            mailMessage.From = new MailAddress(configuration["Smtp:Sender"]!, "DailyFitness");
            mailMessage.Subject = subject;
            mailMessage.Body = body;
            mailMessage.IsBodyHtml = true;
            mailMessage.Priority = mailPriority;
            mailMessage.DeliveryNotificationOptions = DeliveryNotificationOptions.OnFailure;

            var smtpClient = new SmtpClient();
            smtpClient.Host = configuration["Smtp:Host"]!;
            smtpClient.Port = int.Parse(configuration["Smtp:Port"]!);
            smtpClient.EnableSsl = true;
            smtpClient.DeliveryMethod = SmtpDeliveryMethod.Network;
            smtpClient.Credentials =
                new NetworkCredential(configuration["Smtp:UserName"]!, configuration["Smtp:Password"]!);

            await smtpClient.SendMailAsync(mailMessage, ct);

            logEmail.MarkAsSent();
        }
        catch (Exception ex)
        {
            logEmail.MarkAsFailed(ex.ToString());
            throw;
        }
        finally
        {
            logEmailRepository.Add(logEmail);
            await logEmailRepository.SaveChanges(ct);
        }
    }

    private static string BuildDefaultLayout(string title, string bodyHtml, string? preHeader = null)
    {
        var sb = new StringBuilder();

        sb.AppendLine("<!DOCTYPE html>");
        sb.AppendLine("<html lang=\"pt-BR\">");
        sb.AppendLine("<head>");
        sb.AppendLine("<meta charset=\"UTF-8\">");
        sb.AppendLine("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        sb.AppendLine($"<title>{title}</title>");
        sb.AppendLine("</head>");
        sb.AppendLine(
            "<body style=\"margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#111111;\">");

        if (!string.IsNullOrWhiteSpace(preHeader))
        {
            sb.AppendLine(
                $"<div style=\"display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;\">{preHeader}</div>");
        }

        sb.AppendLine(
            "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background-color:#f5f5f5;margin:0;padding:24px 0;\">");
        sb.AppendLine("<tr>");
        sb.AppendLine("<td align=\"center\">");

        sb.AppendLine(
            "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"max-width:600px;background-color:#fff;border-radius:16px;overflow:hidden;\">");

        // Header
        sb.AppendLine("<tr>");
        sb.AppendLine("<td style=\"background-color:#5B21B6;padding:32px 24px;text-align:center;\">");
        sb.AppendLine(
            "<h1 style=\"margin:0;font-size:28px;line-height:36px;color:#FFD54A;font-weight:bold;\">Daily Fitness</h1>");
        sb.AppendLine(
            "<p style=\"margin:12px 0 0 0;font-size:14px;line-height:22px;color:#F3E8FF;\">Sua rotina. Sua evolução. Seu resultado.</p>");
        sb.AppendLine("</td>");
        sb.AppendLine("</tr>");

        // Barra de destaque
        sb.AppendLine("<tr>");
        sb.AppendLine("<td style=\"height:6px;background-color:#FFD54A;\"></td>");
        sb.AppendLine("</tr>");

        // Título
        sb.AppendLine("<tr>");
        sb.AppendLine("<td style=\"padding:32px 24px 16px 24px;\">");
        sb.AppendLine(
            $"<h2 style=\"margin:0;font-size:24px;line-height:32px;color:#111111;font-weight:bold;\">{title}</h2>");
        sb.AppendLine("</td>");
        sb.AppendLine("</tr>");

        // Conteúdo
        sb.AppendLine("<tr>");
        sb.AppendLine("<td style=\"padding:0 24px 32px 24px;\">");
        sb.AppendLine($"{bodyHtml}");
        sb.AppendLine("</td>");
        sb.AppendLine("</tr>");

        // Rodapé
        sb.AppendLine("<tr>");
        sb.AppendLine("<td style=\"background-color:#111111;padding:24px;text-align:center;\">");
        sb.AppendLine(
            "<p style=\"margin:0;font-size:13px;line-height:20px;color:#FFD54A;font-weight:bold;\">Daily Fitness</p>");
        sb.AppendLine(
            "<p style=\"margin:8px 0 0 0;font-size:12px;line-height:18px;color:#D1D5DB;\">Este é um e-mail automático. Caso necessário, entre em contato com o suporte da plataforma.</p>");
        sb.AppendLine("</td>");
        sb.AppendLine("</tr>");

        sb.AppendLine("</table>");

        sb.AppendLine("</td>");
        sb.AppendLine("</tr>");
        sb.AppendLine("</table>");

        sb.AppendLine("</body>");
        sb.AppendLine("</html>");

        return sb.ToString();
    }
}
