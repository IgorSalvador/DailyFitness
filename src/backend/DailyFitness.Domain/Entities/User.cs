using DailyFitness.Domain.Common;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Domain.Entities;

public class User : Entity
{
    public string Email { get; private set; }
    public string PasswordHash { get; private set; }
    public string FirstName { get; private set; }
    public string Surname { get; private set; }
    public EUserProfile Profile { get; private set; }
    public DateTime? LastLoginAt { get; private set; }

    public ICollection<ResetPasswordRequest> ResetPasswordRequests { get; init; }
    public ICollection<ProfessionalRequest>? ProfessionalRequests { get; set; } = new List<ProfessionalRequest>();
    public ICollection<ProfessionalRequest>? EvaluatedProfessionalRequests { get; set; } = new List<ProfessionalRequest>();

    public User()
    {
        Email = string.Empty;
        PasswordHash = string.Empty;
        FirstName = string.Empty;
        Surname = string.Empty;
        Profile = EUserProfile.General;
        ResetPasswordRequests = new List<ResetPasswordRequest>();
    }

    public User(string email, string passwordHash, string firstName, string surname, EUserProfile profile = EUserProfile.General)
    {
        Email = email;
        PasswordHash = passwordHash;
        FirstName = firstName;
        Surname = surname;
        Profile = profile;
        ResetPasswordRequests = new List<ResetPasswordRequest>();
    }

    public void Update(string email, string firstName, string surname)
    {
        Email = email;
        FirstName = firstName;
        Surname = surname;
    }

    public void UpdatePassword(string passwordHash) => PasswordHash = passwordHash;

    public void UpdateLastLoginAt() => LastLoginAt = DateTime.Now;

    public void UpdateProfile(EUserProfile profile) => Profile = profile;
}
