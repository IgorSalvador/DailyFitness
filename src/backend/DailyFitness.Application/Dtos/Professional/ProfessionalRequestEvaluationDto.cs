namespace DailyFitness.Application.Dtos.Professional;

public class ProfessionalRequestEvaluationDto
{
    public string ProfessionalRequestId { get; set; } = string.Empty;
    public bool IsApproved { get; set; } = true;
    public string? Comments { get; set; } = string.Empty;
}
