using DailyFitness.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DailyFitness.Infrastructure.Persistence.Mapping;

public class DietPlanMapping : IEntityTypeConfiguration<DietPlan>
{
    public void Configure(EntityTypeBuilder<DietPlan> builder)
    {
        builder.ToTable("DietPlans");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(1000);
        builder.Property(x => x.Objective).IsRequired();
        builder.Property(x => x.Level).IsRequired();
        builder.Property(x => x.Instructions).HasMaxLength(2000);
        builder.Property(x => x.MinimumDurationDays).IsRequired();
        builder.Property(x => x.Status).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => x.Objective);
        builder.HasIndex(x => x.Level);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.CreatedByUserId);

        builder.HasOne(x => x.CreatedByUser)
            .WithMany()
            .HasForeignKey(x => x.CreatedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(x => x.Meals)
            .WithOne(x => x.DietPlan)
            .HasForeignKey(x => x.DietPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.UserDietPlans)
            .WithOne(x => x.DietPlan)
            .HasForeignKey(x => x.DietPlanId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
