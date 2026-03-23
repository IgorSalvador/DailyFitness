using DailyFitness.Api.Common.Results;
using DailyFitness.Application.Common.Results;
using Microsoft.AspNetCore.Mvc;

namespace DailyFitness.Api.Common.Extensions;

public static class ResultDtoExtension
{
    public static IActionResult ToActionResult<T>(this ResultsDto<T> result, ControllerBase controller)
    {
        if (result.Success)
            return controller.Ok(new SuccessResult<T>(true, result.Message, result.Data));

        return controller.BadRequest(new ErrorResult(false, result.Message, result.Errors));
    }
}
