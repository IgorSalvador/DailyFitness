using DailyFitness.Api.Middleware;
using Scalar.AspNetCore;

namespace DailyFitness.Api.Common.Extensions;

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

        public void UseGlobalExceptionHandler()
        {
            app.UseMiddleware<ExceptionHandlingMiddleware>();
        }
    }
}
