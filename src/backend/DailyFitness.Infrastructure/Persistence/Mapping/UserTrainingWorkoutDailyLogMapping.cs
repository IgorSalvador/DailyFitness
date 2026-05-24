using DailyFitness.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DailyFitness.Infrastructure.Persistence.Mapping;

public class UserTrainingWorkoutDailyLogMapping : IEntityTypeConfiguration<UserTrainingWorkoutDailyLog>
{
    public void Configure(EntityTypeBuilder<UserTrainingWorkoutDailyLog> builder)
    {
        builder.ToTable("UserTrainingWorkoutDailyLogs");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserTrainingPlanId)
            .IsRequired();

        builder.Property(x => x.TrainingWorkoutId)
            .IsRequired();

        builder.Property(x => x.ProgressDate)
            .IsRequired();

        builder.Property(x => x.ProgressPercentage)
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(x => x.IsFinished)
            .IsRequired();

        builder.Property(x => x.FinishedAt)
            .IsRequired(false);

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasOne(x => x.UserTrainingPlan)
            .WithMany(x => x.DailyLogs)
            .HasForeignKey(x => x.UserTrainingPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.TrainingWorkout)
            .WithMany()
            .HasForeignKey(x => x.TrainingWorkoutId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasIndex(x => x.UserTrainingPlanId);

        // Um log por treino por dia por plano
        builder.HasIndex(x => new { x.UserTrainingPlanId, x.TrainingWorkoutId, x.ProgressDate })
            .IsUnique();
    }
}
