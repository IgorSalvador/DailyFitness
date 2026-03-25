using System.Linq.Expressions;

namespace DailyFitness.Application.Interfaces.Repositories;

public interface IRepository<T> where T : class
{
    IQueryable<T> GetQueryable();
    Task<IEnumerable<T>> Get(CancellationToken ct);
    Task<T?> Get(Guid id, CancellationToken ct);
    void Add(T entity);
    void Update(T entity);
    Task<IEnumerable<T>> Find(Expression<Func<T, bool>> predicate, CancellationToken ct);
    Task<int> CountTotal(CancellationToken ct);
    Task<int> CountTotal(IQueryable<T> query, CancellationToken ct);
    Task<int> SaveChanges(CancellationToken ct);
}
