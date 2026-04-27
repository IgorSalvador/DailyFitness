using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Dtos.Challenge;

public class CreateChallengeDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public EChallengeType Type { get; set; }
    public DateTime ExpectedEndDate { get; set; }

    public Domain.Entities.Challenge ToEntity() => new(Name, Description, Type, ExpectedEndDate);
}
