using DailyFitness.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DailyFitness.Infrastructure.Persistence.Mapping;

public class UserChallengeMapping : IEntityTypeConfiguration<UserChallenge>
{
    public void Configure(EntityTypeBuilder<UserChallenge> builder)
    {
        builder.ToTable("UserChallenges");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserId)
            .IsRequired();

        builder.Property(x => x.ChallengeId)
            .IsRequired();

        builder.Property(x => x.UserChallengeStatus)
            .IsRequired();

        builder.Property(x => x.JoinedAt)
            .IsRequired();

        builder.Property(x => x.CurrentProgress)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(x => x.TargetProgress)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasOne(x => x.User)
            .WithMany(x => x.UserChallenges)
            .HasForeignKey(x => x.UserId);

        builder.HasOne(x => x.Challenge)
            .WithMany(x => x.UserChallenges)
            .HasForeignKey(x => x.ChallengeId);

        // Garante que um usuário não tenha duplicidade de participação ativa no mesmo desafio
        builder.HasIndex(x => new { x.UserId, x.ChallengeId, x.UserChallengeStatus })
            .HasFilter(null);

        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.ChallengeId);
        builder.HasIndex(x => x.UserChallengeStatus);
    }
}
