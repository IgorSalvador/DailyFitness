using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DailyFitness.Application.Interfaces.Services;
using DailyFitness.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DailyFitness.Infrastructure.Authentication;

public class JwtService(IConfiguration configuration) : IJwtService
{
    public string GenerateToken(User user, bool rememberMe = false)
    {
        var claims = new []
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.FirstName),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Profile.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Secret"] ?? string.Empty));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            claims: claims,
            expires: rememberMe ? DateTime.Now.AddHours(8) : DateTime.Now.AddMinutes(30),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
