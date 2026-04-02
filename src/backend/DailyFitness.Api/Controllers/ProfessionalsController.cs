using System.Security.Claims;
using DailyFitness.Application.Dtos.Professional;
using DailyFitness.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DailyFitness.Api.Common.Extensions;

namespace DailyFitness.Api.Controllers;

[ApiController, Authorize]
[Route("[controller]")]
public class ProfessionalsController(IProfessionalService professionalService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var result = await professionalService.Get(cancellationToken);
        return result.ToActionResult(this);
    }

    [HttpPost("create-request")]
    public async Task<IActionResult> CreateProfessionalRequest(CreateProfessionalRequestDto requestDto, CancellationToken cancellationToken)
    {
        var result = await professionalService.CreateProfessionalRequest(requestDto, cancellationToken);
        return result.ToActionResult(this);
    }

    [HttpGet("get-request")]
    public async Task<IActionResult> GetProfessionalRequest([FromQuery] GetProfessionalRequestDto model, CancellationToken cancellationToken)
    {
        var result = await professionalService.GetProfessionalRequest(model, cancellationToken);
        return result.ToActionResult(this);
    }

    [Authorize(Roles = "Administrator")]
    [HttpPost("evaluate-request")]
    public async Task<IActionResult> EvaluateProfessionalRequest(ProfessionalRequestEvaluationDto evaluationDto, CancellationToken cancellationToken)
    {
        var evaluatorId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "");

        var result = await professionalService.EvaluateRequest(evaluationDto, evaluatorId, cancellationToken);
        return result.ToActionResult(this);
    }
}
