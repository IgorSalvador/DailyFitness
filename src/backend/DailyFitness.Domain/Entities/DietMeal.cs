using DailyFitness.Domain.Common;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Domain.Entities;

public class DietMeal : Entity
{
    public Guid DietPlanId { get; private set; }
    public string Name { get; private set; }
    public string Description { get; private set; }
    public EMealPeriod Period { get; private set; }
    public string? Instructions { get; private set; }
    public int Order { get; private set; }

    public DietPlan? DietPlan { get; set; }
    public ICollection<DietMealItem> Items { get; init; }

    public DietMeal()
    {
        Name = string.Empty;
        Description = string.Empty;
        Items = new List<DietMealItem>();
    }

    public DietMeal(
        Guid dietPlanId,
        string name,
        string description,
        EMealPeriod period,
        int order,
        string? instructions = null) : base()
    {
        DietPlanId = dietPlanId;
        Name = name;
        Description = description;
        Period = period;
        Order = order;
        Instructions = instructions;
        Items = new List<DietMealItem>();
    }

    public void Update(
        string name,
        string description,
        EMealPeriod period,
        int order,
        string? instructions)
    {
        Name = name;
        Description = description;
        Period = period;
        Order = order;
        Instructions = instructions;
        UpdatedAt = DateTime.Now;
    }
}
