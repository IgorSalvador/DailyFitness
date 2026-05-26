using DailyFitness.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace DailyFitness.Infrastructure.Persistence.Mapping;

public class UserDietMealDailyLogMapping : IEntityTypeConfiguration<UserDietMealDailyLog>
{
    public void Configure(EntityTypeBuilder<UserDietMealDailyLog> builder)
    {
        builder.ToTable("UserDietMealDailyLogs");

        builder.HasKey(x => x.Id);

        // MySql.EntityFrameworkCore não suporta DateOnly nativamente em todas as queries.
        // O converter garante leitura/escrita correta via DateTime, mantendo a coluna 'date'.
        var dateOnlyConverter = new ValueConverter<DateOnly, DateTime>(
            v => v.ToDateTime(TimeOnly.MinValue),
            v => DateOnly.FromDateTime(v));

        builder.Property(x => x.LogDate)
            .IsRequired()
            .HasColumnType("date")
            .HasConversion(dateOnlyConverter);
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
