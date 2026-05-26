using DailyFitness.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DailyFitness.Infrastructure.Persistence.Mapping;

public class UserDietPlanMapping : IEntityTypeConfiguration<UserDietPlan>
{
    public void Configure(EntityTypeBuilder<UserDietPlan> builder)
    {
        builder.ToTable("UserDietPlans");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserDietPlanStatus).IsRequired();
        builder.Property(x => x.StartedAt).IsRequired();
        builder.Property(x => x.CancellationReason).HasMaxLength(500);
        builder.Property(x => x.Status).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.DietPlanId);
        builder.HasIndex(x => x.UserDietPlanStatus);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Progresses)
            .WithOne(x => x.UserDietPlan)
            .HasForeignKey(x => x.UserDietPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.DailyLogs)
            .WithOne(x => x.UserDietPlan)
            .HasForeignKey(x => x.UserDietPlanId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
