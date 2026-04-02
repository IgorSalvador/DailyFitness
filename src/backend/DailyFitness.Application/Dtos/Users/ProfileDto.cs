using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Dtos.Users;

public class ProfileDto
{
    public Guid Id { get; private set; }
    public string Firstname { get; private set; }
    public string Surname { get; private set; }
    public string Email { get; private set; }

    public ProfileDto(Guid id, string firstname, string surname, string email)
    {
        Id = id;
        Firstname = firstname;
        Surname = surname;
        Email = email;
    }

    public static ProfileDto FromEntity(User user) => new(
        user.Id,
        user.FirstName,
        user.Surname,
        user.Email);

}
