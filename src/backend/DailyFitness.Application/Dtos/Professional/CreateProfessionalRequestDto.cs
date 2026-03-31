using DailyFitness.Domain.Entities;

namespace DailyFitness.Application.Dtos.Professional;

public class CreateProfessionalRequestDto
{
    public string UserId { get; set; } = string.Empty;
    public string Biography { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public List<string> Skills { get; set; } = [];

    public ProfessionalRequest ToEntity() =>
        new(Guid.Parse(UserId), Biography, Specialization, string.Join(", ", Skills));
}
