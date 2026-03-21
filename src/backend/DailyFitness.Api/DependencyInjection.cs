using DailyFitness.Infrastructure;

namespace DailyFitness.Api;


public static class DependencyInjection
{
    extension(WebApplicationBuilder builder)
    {
        public WebApplicationBuilder AddConfiguration()
        {
            builder.AddServices();

            builder.Services.AddInfrastructure(builder.Configuration);

            return builder;
        }

        private void AddServices()
        {
            builder.Services.AddControllers();

            builder.Services.AddOpenApi();
        }
    }
}
