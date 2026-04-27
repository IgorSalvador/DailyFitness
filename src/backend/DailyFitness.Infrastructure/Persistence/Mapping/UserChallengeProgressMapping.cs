using DailyFitness.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DailyFitness.Infrastructure.Persistence.Mapping;

public class UserChallengeProgressMapping : IEntityTypeConfiguration<UserChallengeProgress>
{
    public void Configure(EntityTypeBuilder<UserChallengeProgress> builder)
    {
        builder.ToTable("UserChallengeProgresses");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserChallengeId)
            .IsRequired();

        builder.Property(x => x.ReferenceDate)
            .IsRequired();

        builder.Property(x => x.ReferencePeriod)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.ProgressValue)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(x => x.Notes)
            .HasMaxLength(500);

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasOne(x => x.UserChallenge)
            .WithMany(x => x.Progresses)
            .HasForeignKey(x => x.UserChallengeId);

        builder.HasIndex(x => x.UserChallengeId);
        builder.HasIndex(x => new { x.UserChallengeId, x.ReferencePeriod });
    }
}
