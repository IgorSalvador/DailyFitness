using DailyFitness.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DailyFitness.Infrastructure.Persistence.Mapping;

public class DietMealItemMapping : IEntityTypeConfiguration<DietMealItem>
{
    public void Configure(EntityTypeBuilder<DietMealItem> builder)
    {
        builder.ToTable("DietMealItems");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Instructions).HasMaxLength(1000);
        builder.Property(x => x.Quantity).IsRequired().HasPrecision(10, 3);
        builder.Property(x => x.Unit).IsRequired().HasMaxLength(30);
        builder.Property(x => x.Calories).HasPrecision(10, 2);
        builder.Property(x => x.Protein).HasPrecision(10, 2);
        builder.Property(x => x.Carbohydrates).HasPrecision(10, 2);
        builder.Property(x => x.Fat).HasPrecision(10, 2);
        builder.Property(x => x.Order).IsRequired();
        builder.Property(x => x.Status).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => x.DietMealId);
    }
}
