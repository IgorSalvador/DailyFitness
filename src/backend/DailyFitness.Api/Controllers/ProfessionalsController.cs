using System.Security.Claims;
using DailyFitness.Application.Dtos.Professional;
using DailyFitness.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DailyFitness.Api.Common.Extensions;

namespace DailyFitness.Api.Controllers;

/// <summary>
/// Controller responsible for handling HTTP requests related to professionals and associated operations.
/// </summary>
[ApiController, Authorize]
[Route("[controller]")]
public class ProfessionalsController(IProfessionalService professionalService) : ControllerBase
{
    /// <summary>
    /// Retrieves a collection of professionals asynchronously.
    /// Delegates the retrieval to the underlying service layer.
    /// </summary>
    /// <param name="cancellationToken">A token that allows the operation to be cancelled.</param>
    /// <returns>An <see cref="IActionResult"/> containing the result of the operation.</returns>
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var result = await professionalService.Get(cancellationToken);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Creates a professional request asynchronously based on the provided request details.
    /// Delegates the creation process to the underlying service layer.
    /// </summary>
    /// <param name="requestDto">An instance of <see cref="CreateProfessionalRequestDto"/> containing the details of the professional request to be created.</param>
    /// <param name="cancellationToken">A token that allows the operation to be cancelled.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains an <see cref="IActionResult"/> representing the result of the operation.</returns>
    [HttpPost("create-request")]
    public async Task<IActionResult> CreateProfessionalRequest(CreateProfessionalRequestDto requestDto,
        CancellationToken cancellationToken)
    {
        var result = await professionalService.CreateProfessionalRequest(requestDto, cancellationToken);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Retrieves a professional request based on the specified criteria asynchronously.
    /// Delegates processing to the service layer.
    /// </summary>
    /// <param name="model">The data transfer object containing the criteria for retrieving the professional request.</param>
    /// <param name="cancellationToken">A token that allows the operation to be cancelled.</param>
    /// <returns>An <see cref="IActionResult"/> containing the result of the operation.</returns>
    [HttpGet("get-request")]
    public async Task<IActionResult> GetProfessionalRequest([FromQuery] GetProfessionalRequestDto model,
        CancellationToken cancellationToken)
    {
        var result = await professionalService.GetProfessionalRequest(model, cancellationToken);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Evaluates a professional request asynchronously.
    /// This action is restricted to users with the "Administrator" role.
    /// The evaluation process involves approving or rejecting the request based on the provided details.
    /// </summary>
    /// <param name="evaluationDto">An object containing the details of the professional request evaluation, including approval status, comments, and request identifier.</param>
    /// <param name="cancellationToken">A token that allows the operation to be cancelled.</param>
    /// <returns>An <see cref="IActionResult"/> containing the result of the evaluation process.</returns>
    [Authorize(Roles = "Administrator")]
    [HttpPost("evaluate-request")]
    public async Task<IActionResult> EvaluateProfessionalRequest(ProfessionalRequestEvaluationDto evaluationDto, CancellationToken cancellationToken)
    {
        var evaluatorId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "");

        var result = await professionalService.EvaluateRequest(evaluationDto, evaluatorId, cancellationToken);
        return result.ToActionResult(this);
    }
}
