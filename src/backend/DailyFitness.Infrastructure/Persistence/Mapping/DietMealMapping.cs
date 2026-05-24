using DailyFitness.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DailyFitness.Infrastructure.Persistence.Mapping;

public class DietMealMapping : IEntityTypeConfiguration<DietMeal>
{
    public void Configure(EntityTypeBuilder<DietMeal> builder)
    {
        builder.ToTable("DietMeals");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Period).IsRequired();
        builder.Property(x => x.Instructions).HasMaxLength(1000);
        builder.Property(x => x.Order).IsRequired();
        builder.Property(x => x.Status).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => x.DietPlanId);
        builder.HasIndex(x => x.Period);

        builder.HasMany(x => x.Items)
            .WithOne(x => x.DietMeal)
            .HasForeignKey(x => x.DietMealId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
