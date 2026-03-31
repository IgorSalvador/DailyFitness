using DailyFitness.Api.Common.Extensions;
using DailyFitness.Application;
using DailyFitness.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.AddLogging();
builder.AddConfiguration();
builder.AddDocumentation();
builder.AddAuth();
builder.AddCrossOrigin();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

app.UseGlobalExceptionHandler();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment() || builder.Configuration["IsDevelopment"] == "Y")
    app.ConfigureDevEnvironment();

app.UseCrossOrigin();
app.UseHttpsRedirection();
app.UseAuth();
app.MapControllers();
app.Run();
