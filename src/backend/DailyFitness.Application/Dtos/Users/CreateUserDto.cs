using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Dtos.Users;

public class CreateUserDto
{
    public string Firstname { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;

    public User ToEntity() => new(Email, Password, Firstname, Surname);
}
