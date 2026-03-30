using FluentValidation;
using FluentValidation.Results;

namespace DailyFitness.Application.Services;

public abstract class BaseService
{
    protected ValidationResult ExecuteValidation<TV, TE>(TV validation, TE entity) where TV : AbstractValidator<TE> where TE : class => validation.Validate(entity);
}
