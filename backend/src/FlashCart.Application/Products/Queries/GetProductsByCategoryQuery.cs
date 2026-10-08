using MediatR;
using FlashCart.Domain.Entities;
using FlashCart.Domain.Interfaces;

namespace FlashCart.Application.Products.Queries;

public record GetProductsByCategoryQuery(string Category) : IRequest<IEnumerable<Product>>;

public class GetProductsByCategoryQueryHandler : IRequestHandler<GetProductsByCategoryQuery, IEnumerable<Product>>
{
    private readonly IProductRepository _productRepository;

    public GetProductsByCategoryQueryHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<IEnumerable<Product>> Handle(GetProductsByCategoryQuery request, CancellationToken cancellationToken)
    {
        return await _productRepository.GetByCategoryAsync(request.Category);
    }
}