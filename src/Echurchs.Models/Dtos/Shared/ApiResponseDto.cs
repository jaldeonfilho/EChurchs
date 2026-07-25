namespace Echurchs.Models.Dtos.Shared;

public class ApiResponseDto<T>
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }
    public string? ErrorCode { get; set; }

    public static ApiResponseDto<T> Ok(T data, string? message = null) => new()
    {
        Success = true,
        Message = message,
        Data = data
    };

    public static ApiResponseDto<T> Fail(string message, List<string>? errors = null, string? errorCode = null) => new()
    {
        Success = false,
        Message = message,
        Errors = errors,
        ErrorCode = errorCode
    };

    public static ApiResponseDto<T> SuccessResponse(T data, string? message = null) => Ok(data, message);
    public static ApiResponseDto<T> ErrorResponse(string message, List<string>? errors = null, string? errorCode = null) => Fail(message, errors, errorCode);
}
