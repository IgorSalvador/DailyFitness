using DailyFitness.Api.Common.Extensions;
using DailyFitness.Application;
using DailyFitness.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.AddLogging();
builder.AddConfiguration();
builder.AddDocumentation();
builder.AddAuth();
builder.AddCrossOrigin();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

app.UsePathBase("/DailyFitness");
app.UseCrossOrigin();
app.UseGlobalExceptionHandler();

if (app.Environment.IsDevelopment() || builder.Configuration["IsDevelopment"] == "Y")
    app.ConfigureDevEnvironment();

app.UseHttpsRedirection();
app.UseAuth();
app.MapControllers();
app.Run();
