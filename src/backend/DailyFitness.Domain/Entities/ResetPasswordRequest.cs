using DailyFitness.Domain.Common;

namespace DailyFitness.Domain.Entities;

public class ResetPasswordRequest : Entity
{
    public string Token { get; set; }
    public DateTime ValidUntil { get; set; }
    public Guid UserId { get; set; }

    public User? User { get; set; }

    public ResetPasswordRequest()
    {
        Token = string.Empty;
    }

    public ResetPasswordRequest(string token, Guid userId) : base()
    {
        Token = token;
        UserId = userId;
        ValidUntil = DateTime.Now.AddMinutes(15);
    }
}
