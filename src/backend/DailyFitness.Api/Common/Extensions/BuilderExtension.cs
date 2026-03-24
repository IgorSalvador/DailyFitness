namespace DailyFitness.Api.Common.Extensions;

public static class BuilderExtension
{
    extension(WebApplicationBuilder builder)
    {
        public void AddConfiguration()
        {
            builder.Services.AddControllers();

            ApiConfiguration.FrontendUris = builder.Configuration.GetValue<List<string>>("FrontendUri") ?? [];
        }

        public void AddDocumentation()
        {
            builder.Services.AddOpenApi();
        }

        public void AddCrossOrigin()
        {
            builder.Services.AddCors(options =>
            {
                options.AddPolicy(ApiConfiguration.CorsPolicyName, policy =>
                {
                    policy.WithOrigins(ApiConfiguration.FrontendUris.ToArray())
                        .WithMethods("GET", "POST", "PUT", "DELETE")
                        .WithHeaders("Authorization", "Content-Type")
                        .AllowCredentials();
                });
            });
        }

        public void AddLogging()
        {
            builder.Logging.ClearProviders();
            builder.Logging.AddConsole();
            builder.Logging.AddDebug();
        }
    }
}
