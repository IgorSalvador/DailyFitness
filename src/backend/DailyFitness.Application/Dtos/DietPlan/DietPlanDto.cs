using DailyFitness.Domain.Entities;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Application.Dtos.DietPlan;

public class DietPlanDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public EDietObjective Objective { get; set; }
    public EDietLevel Level { get; set; }
    public string? Instructions { get; set; }
    public int MinimumDurationDays { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid? CreatedByUserId { get; set; }
    public int MealCount { get; set; }
    public int SubscriberCount { get; set; }
    public int ActiveSubscriberCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public IEnumerable<DietMealDto> Meals { get; set; } = [];

    public static DietPlanDto FromEntity(Domain.Entities.DietPlan entity, bool includeMeals = false)
    {
        return new DietPlanDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Objective = entity.Objective,
            Level = entity.Level,
            Instructions = entity.Instructions,
            MinimumDurationDays = entity.MinimumDurationDays,
            Status = entity.Status.ToString(),
            CreatedByUserId = entity.CreatedByUserId,
            MealCount = entity.Meals?.Count ?? 0,
            SubscriberCount = entity.UserDietPlans?.Count ?? 0,
            ActiveSubscriberCount = entity.UserDietPlans?.Count(x => x.IsActive()) ?? 0,
            CreatedAt = entity.CreatedAt,
            Meals = includeMeals && entity.Meals != null
                ? entity.Meals.OrderBy(m => m.Order).Select(DietMealDto.FromEntity)
                : [],
        };
    }
}

public class DietMealDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public EMealPeriod Period { get; set; }
    public string? Instructions { get; set; }
    public int Order { get; set; }
    public IEnumerable<DietMealItemDto> Items { get; set; } = [];

    public static DietMealDto FromEntity(DietMeal entity)
    {
        return new DietMealDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Period = entity.Period,
            Instructions = entity.Instructions,
            Order = entity.Order,
            Items = entity.Items?.OrderBy(i => i.Order).Select(DietMealItemDto.FromEntity) ?? [],
        };
    }
}

public class DietMealItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Instructions { get; set; }
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal? Calories { get; set; }
    public decimal? Protein { get; set; }
    public decimal? Carbohydrates { get; set; }
    public decimal? Fat { get; set; }
    public int Order { get; set; }

    public static DietMealItemDto FromEntity(DietMealItem entity)
    {
        return new DietMealItemDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Instructions = entity.Instructions,
            Quantity = entity.Quantity,
            Unit = entity.Unit,
            Calories = entity.Calories,
            Protein = entity.Protein,
            Carbohydrates = entity.Carbohydrates,
            Fat = entity.Fat,
            Order = entity.Order,
        };
    }
}
