namespace DailyFitness.Domain.Common;

public abstract class Entity
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public EntityStatus Status { get; set; }

    protected Entity()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.Now;
        UpdatedAt = null;
        Status = EntityStatus.Active;
    }

    public void SetAsActive()
    {
        if (Status == EntityStatus.Active) throw new InvalidOperationException("Operação inválida, registro já ativo!.");

        Status = EntityStatus.Active;
        UpdatedAt = DateTime.Now;
    }

    public void SetAsInactive()
    {
        if (Status == EntityStatus.Inactive) throw new InvalidOperationException("Operação inválida, registro já inativo!.");

        Status = EntityStatus.Inactive;
        UpdatedAt = DateTime.Now;
    }
}
