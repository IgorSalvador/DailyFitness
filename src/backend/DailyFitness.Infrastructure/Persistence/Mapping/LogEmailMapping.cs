using DailyFitness.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DailyFitness.Infrastructure.Persistence.Mapping;

public class LogEmailMapping : IEntityTypeConfiguration<LogEmail>
{
    public void Configure(EntityTypeBuilder<LogEmail> builder)
    {
        builder.ToTable("Log_Emails");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.EmailType)
            .IsRequired();

        builder.Property(x => x.Subject)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.Recipients)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(x => x.Body)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(x => x.IsSuccess)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.ErrorMessage)
            .HasMaxLength(4000);
    }
}
