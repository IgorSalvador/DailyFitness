using DailyFitness.Application.Interfaces.Repositories;
using DailyFitness.Application.Interfaces.Security;
using DailyFitness.Application.Interfaces.Services;
using DailyFitness.Infrastructure.Authentication;
using DailyFitness.Infrastructure.Persistence;
using DailyFitness.Infrastructure.Repositories;
using DailyFitness.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DailyFitness.Infrastructure;

public static class DependencyInjection
{
    extension(IServiceCollection services)
    {
        public void AddInfrastructure(IConfiguration configuration)
        {
            services.AddContext(configuration);
            services.AddServices();
            services.AddRepositories();
        }

        private void AddContext(IConfiguration configuration)
        {
            var connectionString =
                configuration.GetConnectionString("DefaultConnection")!;

            services.AddDbContext<AppDbContext>(options =>
                options.UseMySQL(
                    connectionString,
                    mySqlOptions => mySqlOptions.MigrationsAssembly("DailyFitness.Infrastructure")));
        }

        private void AddServices()
        {
            services.AddScoped<IPasswordHasherService, PasswordHasherService>();
            services.AddScoped<IJwtService, JwtService>();
        }

        private void AddRepositories()
        {
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            services.AddScoped<IUserRepository, UserRepository>();
        }
    }
}
