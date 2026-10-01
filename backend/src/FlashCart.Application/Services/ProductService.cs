using FlashCart.Application.Interfaces;
using FlashCart.Domain.Entities;

namespace FlashCart.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;

    public ProductService(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<IReadOnlyList<Product>> GetAllProductsAsync(CancellationToken cancellationToken = default)
    {
        return await _productRepository.GetAllAsync(cancellationToken);
    }
}
