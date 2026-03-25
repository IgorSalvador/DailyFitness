using System.Linq.Expressions;
using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DailyFitness.Infrastructure.Repositories;

public class Repository<T>(AppDbContext context) : IRepository<T> where T : class
{
    protected readonly DbSet<T> set = context.Set<T>();

    public virtual IQueryable<T> GetQueryable()
    {
        return set.AsQueryable();
    }

    public virtual async Task<IEnumerable<T>> Get(CancellationToken ct)
    {
        return await set.AsNoTracking().ToListAsync(ct);
    }

    public virtual async Task<T?> Get(Guid id, CancellationToken ct)
    {
        return await set.FindAsync(id, ct);
    }

    public void Add(T entity)
    {
        set.Add(entity);
    }

    public void Update(T entity)
    {
        context.Entry(entity).State = EntityState.Modified;
    }

    public virtual async Task<IEnumerable<T>> Find(Expression<Func<T, bool>> predicate, CancellationToken ct)
    {
        return await set.AsNoTracking().Where(predicate).ToListAsync(ct);
    }

    public async Task<int> CountTotal(CancellationToken ct)
    {
        return await set.CountAsync(ct);
    }

    public virtual async Task<int> CountTotal(IQueryable<T> query, CancellationToken ct)
    {
        return await query.CountAsync(ct);
    }

    public async Task<int> SaveChanges(CancellationToken ct)
    {
        return await context.SaveChangesAsync(ct);
    }
}
