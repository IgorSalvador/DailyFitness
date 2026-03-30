namespace DailyFitness.Application.Dtos.Users;

public class ResetUserPasswordDto
{
    public string Token { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}
