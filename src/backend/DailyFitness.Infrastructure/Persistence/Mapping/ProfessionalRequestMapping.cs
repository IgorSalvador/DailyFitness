using DailyFitness.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DailyFitness.Infrastructure.Persistence.Mapping;

public class ProfessionalRequestMapping : IEntityTypeConfiguration<ProfessionalRequest>
{
    public void Configure(EntityTypeBuilder<ProfessionalRequest> builder)
    {
        builder.ToTable("ProfessionalRequests");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserId)
            .IsRequired();

        builder.Property(x => x.Biography)
            .HasMaxLength(6000)
            .IsRequired();

        builder.Property(x => x.Skills)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(x => x.ProfessionalRequestStatus)
            .IsRequired();

        builder.Property(x => x.EvaluationComments)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.Status)
            .IsRequired();

        builder.HasOne(x => x.User)
            .WithMany(x => x.ProfessionalRequests)
            .HasForeignKey(x => x.UserId);

        builder.HasOne(x => x.Evaluator)
            .WithMany(x => x.EvaluatedProfessionalRequests)
            .HasForeignKey(x => x.EvaluatorId);
    }
}
