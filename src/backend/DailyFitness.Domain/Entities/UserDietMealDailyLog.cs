using DailyFitness.Domain.Common;

namespace DailyFitness.Domain.Entities;

public class UserDietMealDailyLog : Entity
{
    public Guid UserDietPlanId { get; private set; }
    public Guid DietMealId { get; private set; }
    public DateOnly LogDate { get; private set; }
    public int TotalItems { get; private set; }
    public int CompletedItems { get; private set; }
    public decimal CompletionPercentage { get; private set; }

    public UserDietPlan? UserDietPlan { get; set; }
    public DietMeal? DietMeal { get; set; }

    public UserDietMealDailyLog() { }

    public UserDietMealDailyLog(
        Guid userDietPlanId,
        Guid dietMealId,
        DateOnly logDate,
        int totalItems,
        int completedItems) : base()
    {
        UserDietPlanId = userDietPlanId;
        DietMealId = dietMealId;
        LogDate = logDate;
        TotalItems = totalItems;
        CompletedItems = completedItems;
        CompletionPercentage = totalItems > 0 ? Math.Round((decimal)completedItems / totalItems * 100, 2) : 0;
    }

    public void Update(int totalItems, int completedItems)
    {
        TotalItems = totalItems;
        CompletedItems = completedItems;
        CompletionPercentage = totalItems > 0 ? Math.Round((decimal)completedItems / totalItems * 100, 2) : 0;
        UpdatedAt = DateTime.Now;
    }
}
