using DailyFitness.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DailyFitness.Infrastructure;

public static class DependencyInjection
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddInfrastructure(IConfiguration configuration)
        {
            services.AddContext(configuration);
            services.AddServices();
            services.AddRepositories();

            return services;
        }

        private void AddContext(IConfiguration configuration)
        {
            var connectionString =
                configuration.GetConnectionString("DefaultConnection") ??
                Environment.GetEnvironmentVariable("DefaultConnection") ??
                string.Empty;

            services.AddDbContext<AppDbContext>(options =>
                options.UseMySQL(
                    connectionString,
                    mySqlOptions => mySqlOptions.MigrationsAssembly("DailyFitness.Infrastructure")));
        }

        private void AddServices()
        {
            // Todo -> Add Future services
        }

        private void AddRepositories()
        {
            // Todo -> Add Future repositories
        }
    }
}
