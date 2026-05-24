using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Dtos.DietPlan;

public class UpdateDietPlanDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public EDietObjective Objective { get; set; }
    public EDietLevel Level { get; set; }
    public int MinimumDurationDays { get; set; }
    public string? Instructions { get; set; }
    public IEnumerable<CreateDietMealDto> Meals { get; set; } = [];
}
