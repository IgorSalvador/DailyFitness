using DailyFitness.Domain.Common;
using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Dtos.Professional;

public class ProfessionalDto
{
    public Guid Id { get; private set; }
    public string Firstname { get; private set; }
    public string Surname { get; private set; }
    public string Email { get; private set; }
    public string Biography { get; set; }
    public string Specialization { get; set; }
    public List<string> Skills { get; set; }


    public ProfessionalDto(Guid id, string firstname, string surname, string email, string biography,
        string specialization, string skills)
    {
        Id = id;
        Firstname = firstname;
        Surname = surname;
        Email = email;
        Biography = biography;
        Specialization = specialization;
        Skills = skills.Split(',').ToList();
    }

    public static ProfessionalDto FromEntity(User user) => new(
        user.Id,
        user.FirstName,
        user.Surname,
        user.Email,
        user.ProfessionalRequests?.First().Biography ?? string.Empty,
        user.ProfessionalRequests?.First().Specialization ?? string.Empty,
        user.ProfessionalRequests?.First().Skills ?? string.Empty);
}
