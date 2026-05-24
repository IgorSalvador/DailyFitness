using DailyFitness.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DailyFitness.Infrastructure.Persistence.Mapping;

public class UserTrainingPlanMapping : IEntityTypeConfiguration<UserTrainingPlan>
{
    public void Configure(EntityTypeBuilder<UserTrainingPlan> builder)
    {
        builder.ToTable("UserTrainingPlans");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserId)
            .IsRequired();

        builder.Property(x => x.TrainingPlanId)
            .IsRequired();

        builder.Property(x => x.UserTrainingPlanStatus)
            .IsRequired();

        builder.Property(x => x.StartedAt)
            .IsRequired();

        builder.Property(x => x.CancelledAt)
            .IsRequired(false);

        builder.Property(x => x.CompletedAt)
            .IsRequired(false);

        builder.Property(x => x.CancellationReason)
            .HasMaxLength(1000)
            .IsRequired(false);

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.TrainingPlan)
            .WithMany(x => x.UserTrainingPlans)
            .HasForeignKey(x => x.TrainingPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.TrainingPlanId);
        builder.HasIndex(x => x.UserTrainingPlanStatus);
        builder.HasIndex(x => new { x.UserId, x.UserTrainingPlanStatus });
    }
}
