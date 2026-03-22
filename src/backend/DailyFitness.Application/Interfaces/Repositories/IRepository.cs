using System.Linq.Expressions;

namespace DailyFitness.Application.Interfaces.Repositories;

public interface IRepository<T> where T : class
{
    IQueryable<T> GetQueryable();
    Task<IEnumerable<T>> Get();
    Task<T?> Get(Guid id);
    void Add(T entity);
    void Update(T entity);
    Task<IEnumerable<T>> Find(Expression<Func<T, bool>> predicate);
    Task<int> CountTotal();
    Task<int> CountTotal(IQueryable<T> query);
    Task<int> SaveChanges();
}
