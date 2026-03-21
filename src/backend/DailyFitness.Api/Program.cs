using DailyFitness.Api;
using DailyFitness.Api.Common.Api;
using DailyFitness.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.AddConfiguration();
builder.AddDocumentation();

builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
    app.ConfigureDevEnvironment();

app.UseCrossOrigin();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
