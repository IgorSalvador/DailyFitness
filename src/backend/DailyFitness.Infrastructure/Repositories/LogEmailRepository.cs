using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Domain.Entities;
using DailyFitness.Infrastructure.Persistence;
using Microsoft.Extensions.Configuration;

namespace DailyFitness.Infrastructure.Repositories;

public class LogEmailRepository(AppDbContext context)
    : Repository<LogEmail>(context), ILogEmailRepository
{

}
