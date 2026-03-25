namespace DailyFitness.Application.Dtos.Authentication;

public class LoginResultDto
{
    public string Token { get; private set; }
    public DateTime ValidUntil { get; private set; }

    public LoginResultDto(string token, DateTime validUntil)
    {
        Token = token;
        ValidUntil = validUntil;
    }
}
