using MediatR;
using Microsoft.AspNetCore.Mvc;
using FlashCart.Application.Products.Queries;
using FlashCart.Application.DTOs;
using FlashCart.Domain.Entities;

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
    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
    {
        var categories = await _mediator.Send(new GetCategoriesQuery());
        return Ok(categories);
    }

    [HttpGet("category/{category}")]
    public async Task<ActionResult<IEnumerable<Product>>> GetByCategory(string category)
    {
        var products = await _mediator.Send(new GetProductsByCategoryQuery(category));
        return Ok(products);
    }
}