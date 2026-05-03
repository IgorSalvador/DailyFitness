using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Dtos.Professional;

public class ProfessionalRequestDto
{
    public string Id { get; set; } = string.Empty;
    public string UserName { get; set; }
    public string UserEmail { get; set; }
    public string Biography { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public List<string> Skills { get; set; } = [];
    public EProfessionalRequestStatus ProfessionalRequestStatus { get; set; }
    public DateTime? EvaluatedOn { get; set; }
    public string? EvaluationComments { get; set; }
    public string? EvaluatorFullName { get; set; }

    public ProfessionalRequestDto()
    {
    }

    public ProfessionalRequestDto(Guid id, string userName, string userEmail, string biography, string specialization, string skills,
        EProfessionalRequestStatus professionalRequestStatus, DateTime? evaluatedOn, string? evaluationComments,
        string? evaluatorFullName)
    {
        Id = id.ToString();
        UserName = userName;
        UserEmail = userEmail;
        Biography = biography;
        Specialization = specialization;
        Skills = skills.Split(',').ToList();
        ProfessionalRequestStatus = professionalRequestStatus;
        EvaluatedOn = evaluatedOn;
        EvaluationComments = evaluationComments;
        EvaluatorFullName = evaluatorFullName;
    }

    public static ProfessionalRequestDto FromEntity(ProfessionalRequest request)
        => new(request.Id,
            $"{request.User!.FirstName} {request.User!.Surname}",
            request.User!.Email,
            request.Biography,
            request.Specialization,
            request.Skills,
            request.ProfessionalRequestStatus,
            request.EvaluatedOn,
            request.EvaluationComments,
            $"{request.Evaluator?.FirstName} {request.Evaluator?.Surname}");
}
