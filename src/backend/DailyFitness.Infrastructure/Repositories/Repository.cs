using System.Linq.Expressions;
using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DailyFitness.Infrastructure.Repositories;

public abstract class Repository<T>(AppDbContext context) : IRepository<T> where T : class
{
    protected readonly DbSet<T> set = context.Set<T>();

    public virtual IQueryable<T> GetQueryable()
    {
        return set.AsQueryable();
    }

    public virtual async Task<IEnumerable<T>> Get()
    {
        return await set.AsNoTracking().ToListAsync();
    }

    public virtual async Task<T?> Get(Guid id)
    {
        return await set.FindAsync(id);
    }

    public void Add(T entity)
    {
        set.Add(entity);
    }

    public void Update(T entity)
    {
        context.Entry(entity).State = EntityState.Modified;
    }

    public virtual async Task<IEnumerable<T>> Find(Expression<Func<T, bool>> predicate)
    {
        return await set.AsNoTracking().Where(predicate).ToListAsync();
    }

    public async Task<int> CountTotal()
    {
        return await set.CountAsync();
    }

    public virtual async Task<int> CountTotal(IQueryable<T> query)
    {
        return await query.CountAsync();
    }

    public async Task<int> SaveChanges()
    {
        return await context.SaveChangesAsync();
    }
}
