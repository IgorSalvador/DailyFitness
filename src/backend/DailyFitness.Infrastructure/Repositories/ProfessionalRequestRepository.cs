using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Domain.Entities;
using DailyFitness.Infrastructure.Persistence;

namespace DailyFitness.Infrastructure.Repositories;

public class ProfessionalRequestRepository (AppDbContext context)
    : Repository<ProfessionalRequest>(context), IProfessionalRequestRepository
{

}
