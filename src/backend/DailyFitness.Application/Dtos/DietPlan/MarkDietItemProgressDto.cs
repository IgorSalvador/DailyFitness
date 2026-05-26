namespace DailyFitness.Application.Dtos.DietPlan;

public class MarkDietItemProgressDto
{
    public bool IsCompleted { get; set; }
    public DateOnly? ProgressDate { get; set; }
}
