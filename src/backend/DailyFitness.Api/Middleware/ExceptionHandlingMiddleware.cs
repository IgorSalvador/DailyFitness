using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using DailyFitness.Api.Common.Models;
using DailyFitness.Application.Common.ErrorCodes;

namespace DailyFitness.Api.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await next(httpContext);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(httpContext, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var traceId = context.TraceIdentifier;

        var (statusCode, errorCode, message, errors, logLevel) = exception switch
        {
            UnauthorizedAccessException => (
                StatusCodes.Status401Unauthorized,
                ErrorCodes.Unauthorized,
                "Acesso não autorizado.",
                Array.Empty<string>(),
                LogLevel.Warning
            ),

            _ => (
                StatusCodes.Status500InternalServerError,
                ErrorCodes.InternalServerError,
                $"Ocorreu um erro interno na aplicação.",
                Array.Empty<string>(),
                LogLevel.Error

                // TODO -> Implementar logging no banco de exceções
            )
        };

        if (logLevel == LogLevel.Error)
        {
            logger.LogError(
                exception,
                "Erro não tratado. TraceId: {TraceId}, Path: {Path}, Method: {Method}",
                traceId,
                context.Request.Path,
                context.Request.Method);
        }
        else
        {
            logger.LogWarning(
                exception,
                "Exceção tratada. TraceId: {TraceId}, Path: {Path}, Method: {Method}",
                traceId,
                context.Request.Path,
                context.Request.Method);
        }

        var response = new ErrorResponse
        {
            Message = message,
            ErrorCode = errorCode,
            StatusCode = statusCode,
            TraceId = traceId,
            Errors = errors
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
