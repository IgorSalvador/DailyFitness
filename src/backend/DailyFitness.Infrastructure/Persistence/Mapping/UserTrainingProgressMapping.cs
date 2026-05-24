using DailyFitness.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DailyFitness.Infrastructure.Persistence.Mapping;

public class UserTrainingProgressMapping : IEntityTypeConfiguration<UserTrainingProgress>
{
    public void Configure(EntityTypeBuilder<UserTrainingProgress> builder)
    {
        builder.ToTable("UserTrainingProgresses");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserTrainingPlanId)
            .IsRequired();

        builder.Property(x => x.TrainingWorkoutId)
            .IsRequired();

        builder.Property(x => x.TrainingWorkoutItemId)
            .IsRequired();

        builder.Property(x => x.ProgressDate)
            .IsRequired();

        builder.Property(x => x.CompletedAt)
            .IsRequired();

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasOne(x => x.UserTrainingPlan)
            .WithMany(x => x.Progresses)
            .HasForeignKey(x => x.UserTrainingPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.TrainingWorkout)
            .WithMany()
            .HasForeignKey(x => x.TrainingWorkoutId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(x => x.TrainingWorkoutItem)
            .WithMany()
            .HasForeignKey(x => x.TrainingWorkoutItemId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasIndex(x => x.UserTrainingPlanId);
        builder.HasIndex(x => x.TrainingWorkoutId);

        // Impede duplicidade: mesmo item, mesmo dia, mesmo plano
        builder.HasIndex(x => new { x.UserTrainingPlanId, x.TrainingWorkoutItemId, x.ProgressDate })
            .IsUnique();
    }
}
