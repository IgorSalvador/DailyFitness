namespace DailyFitness.Application.Dtos.Authentication;

public class LoginResultDto
{
    public string Token { get; private set; }

    public LoginResultDto(string token)
    {
        Token = token;
    }
}
