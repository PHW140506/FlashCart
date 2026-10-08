using MediatR;
using Microsoft.AspNetCore.Mvc;
using FlashCart.Application.Carts.Queries;
using FlashCart.Application.DTOs;

namespace FlashCart.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CartsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CartDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetCartsQuery());
        return Ok(result);
    }
}