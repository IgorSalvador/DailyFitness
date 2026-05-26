namespace DailyFitness.Application.Dtos.DietPlan;

public class CancelDietPlanDto
{
    public Guid UserDietPlanId { get; set; }
    public string? Reason { get; set; }
}
