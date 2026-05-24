using DailyFitness.Domain.Common;
using DailyFitness.Domain.ValueObjects;

namespace DailyFitness.Domain.Entities;

public class DietPlan : Entity
{
    public string Name { get; private set; }
    public string Description { get; private set; }
    public EDietObjective Objective { get; private set; }
    public EDietLevel Level { get; private set; }
    public string? Instructions { get; private set; }
    public int MinimumDurationDays { get; private set; }
    public Guid? CreatedByUserId { get; private set; }

    public User? CreatedByUser { get; set; }
    public ICollection<DietMeal> Meals { get; init; }
    public ICollection<UserDietPlan> UserDietPlans { get; init; }

    public DietPlan()
    {
        Name = string.Empty;
        Description = string.Empty;
        Meals = new List<DietMeal>();
        UserDietPlans = new List<UserDietPlan>();
    }

    public DietPlan(
        string name,
        string description,
        EDietObjective objective,
        EDietLevel level,
        int minimumDurationDays,
        string? instructions = null,
        Guid? createdByUserId = null) : base()
    {
        Name = name;
        Description = description;
        Objective = objective;
        Level = level;
        MinimumDurationDays = minimumDurationDays;
        Instructions = instructions;
        CreatedByUserId = createdByUserId;
        Meals = new List<DietMeal>();
        UserDietPlans = new List<UserDietPlan>();
    }

    public void Update(
        string name,
        string description,
        EDietObjective objective,
        EDietLevel level,
        int minimumDurationDays,
        string? instructions)
    {
        Name = name;
        Description = description;
        Objective = objective;
        Level = level;
        MinimumDurationDays = minimumDurationDays;
        Instructions = instructions;
        UpdatedAt = DateTime.Now;
    }

    public bool IsAvailableForSubscription() =>
        Status == EntityStatus.Active;
}
