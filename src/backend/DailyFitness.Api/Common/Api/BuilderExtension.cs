namespace DailyFitness.Api.Common.Api;

public static class BuilderExtension
{
    extension(WebApplicationBuilder builder)
    {
        public void AddConfiguration()
        {
            builder.Services.AddControllers();

            ApiConfiguration.FrontendUri = builder.Configuration["FrontendUri"] ??
                                           Environment.GetEnvironmentVariable("FrontendUri") ??
                                           string.Empty;

            ApiConfiguration.BackendUri = builder.Configuration["BackendUri"] ??
                                          Environment.GetEnvironmentVariable("BackendUri") ??
                                          string.Empty;
        }

        public void AddDocumentation()
        {
            builder.Services.AddOpenApi();
        }
    }
}
