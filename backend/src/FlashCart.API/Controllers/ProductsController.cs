using MediatR;
using Microsoft.AspNetCore.Mvc;
using FlashCart.Application.Products.Queries;
using FlashCart.Application.DTOs;

namespace FlashCart.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAll([FromQuery] string? category)
    {
        var result = await _mediator.Send(new GetProductsQuery(category));
        return Ok(result);
    }
}