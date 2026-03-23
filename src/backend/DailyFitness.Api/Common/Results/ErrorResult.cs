namespace DailyFitness.Api.Common.Results;

public class ErrorResult(bool success, string? message, IReadOnlyCollection<string>? errors)
{
    public bool Success { get; private set; } = success;
    public string? Message { get; private set; } = message;
    public IReadOnlyCollection<string>? Errors { get; private set; } = errors;
}
