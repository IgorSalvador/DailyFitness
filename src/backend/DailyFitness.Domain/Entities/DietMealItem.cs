using DailyFitness.Domain.Common;

namespace DailyFitness.Domain.Entities;

public class DietMealItem : Entity
{
    public Guid DietMealId { get; private set; }
    public string Name { get; private set; }
    public string Description { get; private set; }
    public string? Instructions { get; private set; }
    public decimal Quantity { get; private set; }
    public string Unit { get; private set; }
    public decimal? Calories { get; private set; }
    public decimal? Protein { get; private set; }
    public decimal? Carbohydrates { get; private set; }
    public decimal? Fat { get; private set; }
    public int Order { get; private set; }

    public DietMeal? DietMeal { get; set; }

    public DietMealItem()
    {
        Name = string.Empty;
        Description = string.Empty;
        Unit = string.Empty;
    }

    public DietMealItem(
        Guid dietMealId,
        string name,
        string description,
        decimal quantity,
        string unit,
        int order,
        string? instructions = null,
        decimal? calories = null,
        decimal? protein = null,
        decimal? carbohydrates = null,
        decimal? fat = null) : base()
    {
        DietMealId = dietMealId;
        Name = name;
        Description = description;
        Quantity = quantity;
        Unit = unit;
        Order = order;
        Instructions = instructions;
        Calories = calories;
        Protein = protein;
        Carbohydrates = carbohydrates;
        Fat = fat;
    }

    public void Update(
        string name,
        string description,
        decimal quantity,
        string unit,
        int order,
        string? instructions,
        decimal? calories,
        decimal? protein,
        decimal? carbohydrates,
        decimal? fat)
    {
        Name = name;
        Description = description;
        Quantity = quantity;
        Unit = unit;
        Order = order;
        Instructions = instructions;
        Calories = calories;
        Protein = protein;
        Carbohydrates = carbohydrates;
        Fat = fat;
        UpdatedAt = DateTime.Now;
    }
}
