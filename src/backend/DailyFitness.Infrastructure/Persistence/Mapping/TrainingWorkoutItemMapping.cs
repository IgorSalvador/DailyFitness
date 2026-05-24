using DailyFitness.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DailyFitness.Infrastructure.Persistence.Mapping;

public class TrainingWorkoutItemMapping : IEntityTypeConfiguration<TrainingWorkoutItem>
{
    public void Configure(EntityTypeBuilder<TrainingWorkoutItem> builder)
    {
        builder.ToTable("TrainingWorkoutItems");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TrainingWorkoutId)
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

        builder.Property(x => x.Sets)
            .IsRequired(false);

        builder.Property(x => x.Repetitions)
            .IsRequired(false);

        builder.Property(x => x.Order)
            .IsRequired();

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasOne(x => x.TrainingWorkout)
            .WithMany(x => x.Items)
            .HasForeignKey(x => x.TrainingWorkoutId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.TrainingWorkoutId);
        builder.HasIndex(x => new { x.TrainingWorkoutId, x.Order });
    }
}
