using DailyFitness.Domain.Common;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Domain.Entities;

public class ProfessionalRequest : Entity
{
    public Guid UserId { get; set; }
    public string Biography { get; set; }
    public string Specialization { get; set; }
    public string Skills { get; set; }
    public EProfessionalRequestStatus ProfessionalRequestStatus { get; set; }
    public DateTime? EvaluatedOn { get; set; }
    public Guid? EvaluatorId { get; set; }
    public string? EvaluationComments { get; set; }

    public User? User { get; set; }
    public User? Evaluator { get; set; }

    public ProfessionalRequest()
    {
        Biography = string.Empty;
        Specialization = string.Empty;
        Skills = string.Empty;
    }

    public ProfessionalRequest(Guid userId, string biography, string specialization, string skills)
    {
        UserId = userId;
        Biography = biography;
        Specialization = specialization;
        Skills = skills;
        ProfessionalRequestStatus = EProfessionalRequestStatus.Pending;
    }

    public void SetAsEvaluated(Guid evaluatorId, bool isApproved, string? evaluationComments = "")
    {
        ProfessionalRequestStatus = isApproved
            ? EProfessionalRequestStatus.Approved
            : EProfessionalRequestStatus.Rejected;

        EvaluatedOn = DateTime.Now;
        EvaluatorId = evaluatorId;
        EvaluationComments = evaluationComments;

        UpdatedAt = DateTime.Now;
    }
}
