namespace DailyFitness.Api.Common.Models;

public class ErrorResponse
{
    public bool Success { get; init; } = false;
    public string Message { get; init; } = string.Empty;
    public string? ErrorCode { get; init; }
    public int StatusCode { get; init; }
    public string? TraceId { get; init; }
    public IReadOnlyCollection<string>? Errors { get; init; }
}
