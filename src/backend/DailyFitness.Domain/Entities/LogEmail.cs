using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Domain.Entities;

public class LogEmail
{
    public Guid Id { get; set; }
    public EEmailType EmailType { get; set; }
    public string Subject { get; set; }

    // JSON: ["a@x.com, "b@y.com""]
    public string Recipients { get; set; }

    public string Body { get; set; }

    public bool IsSuccess { get; set; }
    public string ErrorMessage { get; set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime? SentAt { get; set; }

    public LogEmail()
    {

    }

    public LogEmail(string subject, string recipients, string body, string errorMessage)
    {
        Subject = subject;
        Recipients = recipients;
        Body = body;
        ErrorMessage = errorMessage;
    }

    public LogEmail(EEmailType emailType, string subject, string recipients, string body)
    {
        Id = Guid.NewGuid();
        EmailType = emailType;
        Subject = subject;
        Recipients = recipients;
        Body = body;
        IsSuccess = false;
        ErrorMessage = string.Empty;
        CreatedAt = DateTime.Now;
    }

    public void MarkAsSent()
    {
        IsSuccess = true;
        ErrorMessage = string.Empty;
        SentAt = DateTime.Now;
    }

    public void MarkAsFailed(string errorMessage)
    {
        IsSuccess = false;
        ErrorMessage = errorMessage;
    }
}
