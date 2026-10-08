using FlashCart.Domain.Entities;
using FlashCart.Domain.Interfaces;
using MediatR;

namespace FlashCart.Application.Products.Commands;

public sealed record CreateProductCommand(
    string Title, decimal Price, string Description, string Category, string Image)
    : IRequest<ProductWriteResult>;

public sealed class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ProductWriteResult>
{
    private readonly IProductRepository _repository;

    public CreateProductCommandHandler(IProductRepository repository) => _repository = repository;

    public async Task<ProductWriteResult> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var error = ProductWriteValidator.Validate(
            request.Title, request.Price, request.Description, request.Category, request.Image);
        if (error is not null) return new(null, error);

        var created = await _repository.CreateAsync(new Product
        {
            Title = request.Title.Trim(),
            Price = request.Price,
            Description = request.Description.Trim(),
            Category = request.Category.Trim(),
            Image = request.Image.Trim()
        });
        return ProductWriteResult.From(created);
    }
}
