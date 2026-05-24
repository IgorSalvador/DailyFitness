namespace DailyFitness.Application.Dtos.TrainingPlan;

public class MarkTrainingItemProgressDto
{
    // Data de referência — se null, usa hoje
    public DateTime? ProgressDate { get; set; }
}
