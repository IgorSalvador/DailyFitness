using Scalar.AspNetCore;

namespace DailyFitness.Api.Common.Api;

public static class AppExtension
{
    extension(WebApplication app)
    {
        public void ConfigureDevEnvironment()
        {
            app.MapOpenApi();
            app.MapScalarApiReference(options =>
            {
                options.WithTitle("DailyFitness")
                    .WithClassicLayout()
                    .ForceDarkMode()
                    .ShowOperationId()
                    .ExpandAllTags()
                    .SortTagsAlphabetically()
                    .SortOperationsByMethod()
                    .PreserveSchemaPropertyOrder();
            });
        }

        public void UseCrossOrigin()
        {
            app.UseCors(ApiConfiguration.CorsPolicyName);
        }
    }
}
