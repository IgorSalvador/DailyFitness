using DailyFitness.Domain.Common;
using DailyFitness.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DailyFitness.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<LogEmail> LogEmails => Set<LogEmail>();
    public DbSet<ResetPasswordRequest> ResetPasswordRequests => Set<ResetPasswordRequest>();
    public DbSet<ProfessionalRequest> ProfessionalRequests => Set<ProfessionalRequest>();
    public DbSet<Challenge> Challenges => Set<Challenge>();
    public DbSet<UserChallenge> UserChallenges => Set<UserChallenge>();
    public DbSet<UserChallengeProgress> UserChallengeProgresses => Set<UserChallengeProgress>();
    public DbSet<TrainingPlan> TrainingPlans => Set<TrainingPlan>();
    public DbSet<TrainingWorkout> TrainingWorkouts => Set<TrainingWorkout>();
    public DbSet<TrainingWorkoutItem> TrainingWorkoutItems => Set<TrainingWorkoutItem>();
    public DbSet<UserTrainingPlan> UserTrainingPlans => Set<UserTrainingPlan>();
    public DbSet<UserTrainingProgress> UserTrainingProgresses => Set<UserTrainingProgress>();
    public DbSet<UserTrainingWorkoutDailyLog> UserTrainingWorkoutDailyLogs => Set<UserTrainingWorkoutDailyLog>();
    public DbSet<DietPlan> DietPlans => Set<DietPlan>();
    public DbSet<DietMeal> DietMeals => Set<DietMeal>();
    public DbSet<DietMealItem> DietMealItems => Set<DietMealItem>();
    public DbSet<UserDietPlan> UserDietPlans => Set<UserDietPlan>();
    public DbSet<UserDietProgress> UserDietProgresses => Set<UserDietProgress>();
    public DbSet<UserDietMealDailyLog> UserDietMealDailyLogs => Set<UserDietMealDailyLog>();


    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyAuditInfo();
        return await base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        ApplyAuditInfo();
        return base.SaveChanges();
    }

    private void ApplyAuditInfo()
    {
        var entries = ChangeTracker
            .Entries<Entity>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added) entry.Entity.CreatedAt = DateTime.Now;

            if (entry.State == EntityState.Modified) entry.Entity.UpdatedAt = DateTime.Now;
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}
