using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

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

        public void AddAuth()
        {
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"] ?? string.Empty))
                };
            });
            builder.Services.AddAuthorization();
        }

        public void AddDocumentation()
        {
            builder.Services.AddOpenApi("v1", options =>
            {
                options.AddDocumentTransformer<BearerSecuritySchemeTransformer>();
            });
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
