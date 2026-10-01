using FlashCart.Domain.Entities;

namespace FlashCart.Application.Interfaces;

public interface IProductService
{
    Task<IReadOnlyList<Product>> GetAllProductsAsync(CancellationToken cancellationToken = default);
}
