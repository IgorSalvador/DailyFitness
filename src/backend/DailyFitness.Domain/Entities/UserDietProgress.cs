using DailyFitness.Domain.Common;

namespace DailyFitness.Domain.Entities;

public class UserDietProgress : Entity
{
    public Guid UserDietPlanId { get; private set; }
    public Guid DietMealId { get; private set; }
    public Guid DietMealItemId { get; private set; }
    public DateOnly ProgressDate { get; private set; }
    public bool IsCompleted { get; private set; }

    public UserDietPlan? UserDietPlan { get; set; }
    public DietMeal? DietMeal { get; set; }
    public DietMealItem? DietMealItem { get; set; }

    public UserDietProgress() { }

    public UserDietProgress(
        Guid userDietPlanId,
        Guid dietMealId,
        Guid dietMealItemId,
        DateOnly progressDate) : base()
    {
        UserDietPlanId = userDietPlanId;
        DietMealId = dietMealId;
        DietMealItemId = dietMealItemId;
        ProgressDate = progressDate;
        IsCompleted = false;
    }

    public void MarkAsCompleted()
    {
        IsCompleted = true;
        UpdatedAt = DateTime.Now;
    }

    public void MarkAsIncomplete()
    {
        IsCompleted = false;
        UpdatedAt = DateTime.Now;
    }
}
