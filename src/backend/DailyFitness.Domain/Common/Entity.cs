namespace DailyFitness.Domain.Common;

public abstract class Entity
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public EntityStatus Status { get; set; } = EntityStatus.Active;
}
