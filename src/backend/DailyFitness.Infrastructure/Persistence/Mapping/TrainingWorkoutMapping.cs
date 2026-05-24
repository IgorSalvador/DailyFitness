using DailyFitness.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DailyFitness.Infrastructure.Persistence.Mapping;

public class TrainingWorkoutMapping : IEntityTypeConfiguration<TrainingWorkout>
{
    public void Configure(EntityTypeBuilder<TrainingWorkout> builder)
    {
        builder.ToTable("TrainingWorkouts");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TrainingPlanId)
            .IsRequired();

        builder.Property(x => x.Name)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasMaxLength(2000)
            .IsRequired(false);

        builder.Property(x => x.Instructions)
            .HasMaxLength(4000)
            .IsRequired(false);

        builder.Property(x => x.Order)
            .IsRequired();

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasOne(x => x.TrainingPlan)
            .WithMany(x => x.Workouts)
            .HasForeignKey(x => x.TrainingPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.TrainingPlanId);
        builder.HasIndex(x => new { x.TrainingPlanId, x.Order });
    }
}
