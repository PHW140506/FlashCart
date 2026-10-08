using MediatR;
using Microsoft.AspNetCore.Mvc;
using FlashCart.Application.Products.Queries;
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
    public async Task<ActionResult<IEnumerable<Product>>> GetAll()
    {
        var products = await _mediator.Send(new GetProductsQuery());
        return Ok(products);
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

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetById(int id)
    {
        var product = await _mediator.Send(new GetProductByIdQuery(id));
        if (product is null)
        {
            return NotFound(new { message = $"Producto con ID #{id} no encontrado." });
        }
        return Ok(product);
    }
}