using Hiraishin.Domain.Utility.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

internal sealed class TooManyRequestsExceptionHandler : IExceptionHandler
{
    private readonly ILogger<TooManyRequestsExceptionHandler> _logger;

    public TooManyRequestsExceptionHandler(ILogger<TooManyRequestsExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not TooManyRequestsException tooManyRequestsException)
        {
            return false;
        }

        _logger.LogError(
            tooManyRequestsException,
            "Exception occurred: {Message}",
            tooManyRequestsException.Message);

        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status429TooManyRequests,
            Title = "Too Many Requests",
            Detail = tooManyRequestsException.Message
        };

        httpContext.Response.StatusCode = problemDetails.Status.Value;

        await httpContext.Response
            .WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}