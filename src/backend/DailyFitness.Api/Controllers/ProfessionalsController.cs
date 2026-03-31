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
    [HttpPost("create-request")]
    public async Task<IActionResult> CreateProfessionalRequest(CreateProfessionalRequestDto requestDto, CancellationToken cancellationToken)
    {
        var result = await professionalService.CreateProfessionalRequest(requestDto, cancellationToken);
        return result.ToActionResult(this);
    }
}
