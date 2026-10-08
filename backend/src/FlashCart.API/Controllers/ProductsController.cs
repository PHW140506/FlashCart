using FlashCart.Application.DTOs;
using FlashCart.Application.Products.Commands;
using FlashCart.Application.Products.Queries;
using FlashCart.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlashCart.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;
    public ProductsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetAll()
        => Ok(await _mediator.Send(new GetProductsQuery()));

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
        => Ok(await _mediator.Send(new GetCategoriesQuery()));

    [HttpGet("category/{category}")]
    public async Task<ActionResult<IEnumerable<Product>>> GetByCategory(string category)
        => Ok(await _mediator.Send(new GetProductsByCategoryQuery(category)));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetById(int id)
    {
        var product = await _mediator.Send(new GetProductByIdQuery(id));
        return product is null
            ? NotFound(new { message = $"Producto con ID #{id} no encontrado." })
            : Ok(product);
    }

    // US06: autorización efectiva del lado servidor, no solo a través del Guard.
    [Authorize(Roles = "Administrador")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProductInputDto input, CancellationToken ct)
    {
        var result = await _mediator.Send(new CreateProductCommand(
            input.Title, input.Price, input.Description, input.Category, input.Image), ct);
        if (result.Error is not null) return BadRequest(new { message = result.Error });
        return CreatedAtAction(nameof(GetById), new { id = result.Product!.Id }, result.Product);
    }

    // US07: el identificador se recibe de la ruta; jamás se modifica en el payload.
    [Authorize(Roles = "Administrador")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] ProductInputDto input, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpdateProductCommand(
            id, input.Title, input.Price, input.Description, input.Category, input.Image), ct);
        if (result.Error is not null) return BadRequest(new { message = result.Error });
        if (result.NotFound) return NotFound(new { message = "Producto no encontrado." });
        return Ok(result.Product);
    }

    // US08: no reportamos éxito cuando el producto ya no existe.
    [Authorize(Roles = "Administrador")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var deleted = await _mediator.Send(new DeleteProductCommand(id), ct);
        return deleted ? NoContent() : NotFound(new { message = "Producto no encontrado." });
    }
}
