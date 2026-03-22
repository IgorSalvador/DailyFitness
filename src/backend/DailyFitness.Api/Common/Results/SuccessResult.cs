namespace DailyFitness.Api.Common.Results;

public class SuccessResult<T>(bool success, string? message, T? data)
{
    public bool Success { get; private set; } = success;
    public string? Message { get; private set; } = message;
    public T? Data { get; private set; } = data;
}
