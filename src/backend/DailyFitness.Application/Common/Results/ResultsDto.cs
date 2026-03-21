namespace DailyFitness.Application.Common.Results;

public sealed class ResultsDto<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? Message { get; init; }
    public string? ErrorCode { get; init; }
    public IReadOnlyCollection<string>? Errors { get; init; }

    private ResultsDto(bool success, T? data, string? message = null)
    {
        Success = success;
        Data = data;
        Message = message;
    }

    private ResultsDto(bool success, string? message = null, string? errorCode = null, List<string>? errors = null) : this(success, default, message)
    {
        ErrorCode = errorCode;
        Errors = errors;
    }

    public static ResultsDto<T> Ok(T data, string? message = null)
        => new(true, data, message);

    public static ResultsDto<T> Fail(string? message = null, string? errorCode = null, List<string>? errors = null)
        => new (false, message, errorCode, errors);
}
