using DailyFitness.Domain.Common;
using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Dtos.Users;

public class UserDto
{
    public Guid Id { get; private set; }
    public string Firstname { get; private set; }
    public string Surname { get; private set; }
    public string Email { get; private set; }
    public string Profile { get; private set; }
    public EntityStatus Status { get; set; }
    public DateTime? LastLogin { get; private set; }

    public UserDto(Guid id, string firstname, string surname, string email, string profile,
        EntityStatus status, DateTime? lastLogin)
    {
        Id = id;
        Firstname = firstname;
        Surname = surname;
        Email = email;
        Profile = profile;
        Status = status;
        LastLogin = lastLogin;
    }

    public static UserDto FromEntity(User user) => new(
        user.Id,
        user.FirstName,
        user.Surname,
        user.Email,
        user.Profile.ToString(),
        user.Status,
        user.LastLoginAt);
}
