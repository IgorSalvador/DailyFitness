using DailyFitness.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DailyFitness.Infrastructure.Persistence.Mapping;

public class UserDietMealDailyLogMapping : IEntityTypeConfiguration<UserDietMealDailyLog>
{
    public void Configure(EntityTypeBuilder<UserDietMealDailyLog> builder)
    {
        builder.ToTable("UserDietMealDailyLogs");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.LogDate).IsRequired();
        builder.Property(x => x.TotalItems).IsRequired();
        builder.Property(x => x.CompletedItems).IsRequired();
        builder.Property(x => x.CompletionPercentage).IsRequired().HasPrecision(5, 2);
        builder.Property(x => x.Status).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => new { x.UserDietPlanId, x.DietMealId, x.LogDate })
            .IsUnique();

        builder.HasOne(x => x.DietMeal)
            .WithMany()
            .HasForeignKey(x => x.DietMealId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
