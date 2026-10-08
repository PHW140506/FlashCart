using FlashCart.Domain.Entities;
using FlashCart.Domain.Interfaces;
using MediatR;

namespace FlashCart.Application.Products.Commands;

public record UpdateProductCommand(
    int Id,
    string Title,
    decimal Price,
    string Description,
    string Category,
    string Image
) : IRequest<Product?>;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, Product?>
{
    private readonly IProductRepository _productRepository;

    public UpdateProductCommandHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Product?> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        // Validación de reglas de negocio
        if (string.IsNullOrWhiteSpace(request.Title))
            throw new ArgumentException("El título del producto no puede estar vacío.");

        if (request.Price <= 0)
            throw new ArgumentException("El precio debe ser mayor a 0.");

        var product = new Product
        {
            Id = request.Id,
            Title = request.Title.Trim(),
            Price = request.Price,
            Description = request.Description?.Trim() ?? string.Empty,
            Category = request.Category?.Trim() ?? string.Empty,
            Image = request.Image?.Trim() ?? string.Empty
        };

        return await _productRepository.UpdateAsync(product);
    }
}