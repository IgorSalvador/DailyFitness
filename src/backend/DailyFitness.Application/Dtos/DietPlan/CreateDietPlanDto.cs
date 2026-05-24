using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Dtos.DietPlan;

public class CreateDietPlanDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public EDietObjective Objective { get; set; }
    public EDietLevel Level { get; set; }
    public int MinimumDurationDays { get; set; }
    public string? Instructions { get; set; }
    public IEnumerable<CreateDietMealDto> Meals { get; set; } = [];
}

public class CreateDietMealDto
{
    public Guid? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public EMealPeriod Period { get; set; }
    public int Order { get; set; }
    public string? Instructions { get; set; }
    public IEnumerable<CreateDietMealItemDto> Items { get; set; } = [];
}

public class CreateDietMealItemDto
{
    public Guid? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public int Order { get; set; }
    public string? Instructions { get; set; }
    public decimal? Calories { get; set; }
    public decimal? Protein { get; set; }
    public decimal? Carbohydrates { get; set; }
    public decimal? Fat { get; set; }
}
