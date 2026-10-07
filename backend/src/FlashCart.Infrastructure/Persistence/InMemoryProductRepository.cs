using FlashCart.Domain.Entities;
using FlashCart.Domain.Interfaces;

namespace FlashCart.Infrastructure.Persistence;

public class InMemoryProductRepository : IProductRepository
{
    private readonly List<Product> _products = new()
    {
        new Product
        {
            Id = 1,
            Title = "Laptop Gamer Pro",
            Price = 1299.99m,
            Description = "Portátil de alto rendimiento para desarrollo y gaming.",
            Category = "electronics",
            Image = "https://placehold.co/300x300?text=Laptop",
            RatingRate = 4.8,
            RatingCount = 120
        },
        new Product
        {
            Id = 2,
            Title = "Audífonos Bluetooth Wireless",
            Price = 79.99m,
            Description = "Cancelación activa de ruido y batería de larga duración.",
            Category = "electronics",
            Image = "https://placehold.co/300x300?text=Audifonos",
            RatingRate = 4.5,
            RatingCount = 85
        },
        new Product
        {
            Id = 3,
            Title = "Camiseta Casual de Algodón",
            Price = 24.50m,
            Description = "Camiseta suave 100% algodón orgánico.",
            Category = "clothing",
            Image = "https://placehold.co/300x300?text=Camiseta",
            RatingRate = 4.1,
            RatingCount = 42
        },
        new Product
        {
            Id = 4,
            Title = "Mochila Ergonómica Impermeable",
            Price = 45.00m,
            Description = "Compartimento para laptop y material resistente al agua.",
            Category = "clothing",
            Image = "https://placehold.co/300x300?text=Mochila",
            RatingRate = 4.6,
            RatingCount = 67
        }
    };

    public Task<IEnumerable<Product>> GetAllAsync()
    {
        return Task.FromResult<IEnumerable<Product>>(_products);
    }

    public Task<Product?> GetByIdAsync(int id)
    {
        var product = _products.FirstOrDefault(p => p.Id == id);
        return Task.FromResult(product);
    }

    public Task<IEnumerable<Product>> GetByCategoryAsync(string category)
    {
        var filtered = _products.Where(p => p.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult<IEnumerable<Product>>(filtered);
    }
}