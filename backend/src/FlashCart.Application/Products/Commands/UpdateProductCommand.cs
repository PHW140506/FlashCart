using FlashCart.Domain.Interfaces;
using MediatR;

namespace FlashCart.Application.Products.Commands;

public sealed record UpdateProductCommand(
    int Id, string Title, decimal Price, string Description, string Category, string Image)
    : IRequest<ProductWriteResult>;

public sealed class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, ProductWriteResult>
{
    private readonly IProductRepository _repository;

    public UpdateProductCommandHandler(IProductRepository repository) => _repository = repository;

    public async Task<ProductWriteResult> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var error = ProductWriteValidator.Validate(
            request.Title, request.Price, request.Description, request.Category, request.Image);
        if (error is not null) return new(null, error);

        var product = await _repository.GetByIdAsync(request.Id);
        if (product is null) return new(null, NotFound: true);

        product.Title = request.Title.Trim();
        product.Price = request.Price;
        product.Description = request.Description.Trim();
        product.Category = request.Category.Trim();
        product.Image = request.Image.Trim();

        var updated = await _repository.UpdateAsync(product);
        return updated is null ? new(null, NotFound: true) : ProductWriteResult.From(updated);
    }
}
