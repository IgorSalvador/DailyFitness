using DailyFitness.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace DailyFitness.Infrastructure.Persistence.Mapping;

public class UserDietProgressMapping : IEntityTypeConfiguration<UserDietProgress>
{
    public void Configure(EntityTypeBuilder<UserDietProgress> builder)
    {
        builder.ToTable("UserDietProgresses");

        builder.HasKey(x => x.Id);

        // MySql.EntityFrameworkCore não suporta DateOnly nativamente em todas as queries.
        // O converter garante leitura/escrita correta via DateTime, mantendo a coluna 'date'.
        var dateOnlyConverter = new ValueConverter<DateOnly, DateTime>(
            v => v.ToDateTime(TimeOnly.MinValue),
            v => DateOnly.FromDateTime(v));

        builder.Property(x => x.ProgressDate)
            .IsRequired()
            .HasColumnType("date")
            .HasConversion(dateOnlyConverter);

        builder.Property(x => x.IsCompleted).IsRequired();
        builder.Property(x => x.Status).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => new { x.UserDietPlanId, x.DietMealItemId, x.ProgressDate })
            .IsUnique();

        builder.HasIndex(x => x.DietMealId);

        builder.HasOne(x => x.DietMeal)
            .WithMany()
            .HasForeignKey(x => x.DietMealId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.DietMealItem)
            .WithMany()
            .HasForeignKey(x => x.DietMealItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
