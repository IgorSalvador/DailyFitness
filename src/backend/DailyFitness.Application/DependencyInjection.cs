using DailyFitness.Application.Interfaces.Services;
using DailyFitness.Application.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace DailyFitness.Application;

public static class DependencyInjection
{
    extension(IServiceCollection services)
    {
        public void AddApplication()
        {
            services.AddServices();
            services.AddValidation();
        }

        private void AddServices()
        {
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IProfessionalService, ProfessionalService>();
        }

        private void AddValidation()
            => services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
    }
}
