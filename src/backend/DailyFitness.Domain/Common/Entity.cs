namespace DailyFitness.Domain.Common;

public abstract class Entity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? UpdatedAt { get; set; } = null;
    public EntityStatus Status { get; private set; } = EntityStatus.Active;

    protected void SetAsActive()
    {
        if (Status == EntityStatus.Active) throw new InvalidOperationException("Operação inválida, registro já ativo!.");
        Status = EntityStatus.Active;
    }

    protected void SetAsInactive()
    {
        if (Status == EntityStatus.Inactive) throw new InvalidOperationException("Operação inválida, registro já inativo!.");
        Status = EntityStatus.Inactive;
    }

}
