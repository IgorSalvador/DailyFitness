using DailyFitness.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DailyFitness.Infrastructure.Persistence.Mapping;

public class ResetPasswordRequestMapping : IEntityTypeConfiguration<ResetPasswordRequest>
{
    public void Configure(EntityTypeBuilder<ResetPasswordRequest> builder)
    {
        builder.ToTable("ResetPasswordRequests");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Token)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(x => x.UserId)
            .IsRequired();

        builder.Property(x => x.ValidUntil)
            .IsRequired();

        builder.HasOne(x => x.User)
            .WithMany(x => x.ResetPasswordRequests)
            .HasForeignKey(x => x.UserId);
    }
}
