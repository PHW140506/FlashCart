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
            Title = "Laptop Gamer Pro 15.6\"",
            Price = 1299.99m,
            Description = "Procesador de última generación con 16GB RAM y tarjeta gráfica dedicada.",
            Category = "electronics",
            Image = "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80"
        },
        new Product
        {
            Id = 2,
            Title = "Audífonos Bluetooth Wireless",
            Price = 79.99m,
            Description = "Cancelación de ruido activa y hasta 30 horas de reproducción continua.",
            Category = "electronics",
            Image = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"
        },
        new Product
        {
            Id = 3,
            Title = "Camiseta Casual Algodón",
            Price = 19.99m,
            Description = "100% algodón suave de alta calidad para uso diario.",
            Category = "men's clothing",
            Image = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80"
        },
        new Product
        {
            Id = 4,
            Title = "Mochila Ergonómica Impermeable",
            Price = 45.50m,
            Description = "Espacio para laptop de hasta 16 pulgadas y compartimentos multifunción.",
            Category = "accessories",
            Image = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80"
        }
    };

    public Task<IEnumerable<Product>> GetAllAsync() => 
        Task.FromResult<IEnumerable<Product>>(_products);

    public Task<Product?> GetByIdAsync(int id) => 
        Task.FromResult(_products.FirstOrDefault(p => p.Id == id));

    public Task<IEnumerable<Product>> GetByCategoryAsync(string category) => 
        Task.FromResult(_products.Where(p => p.Category.Equals(category, StringComparison.OrdinalIgnoreCase)));
    public Task<IEnumerable<string>> GetCategoriesAsync() =>
        Task.FromResult(_products.Select(p => p.Category).Distinct(StringComparer.OrdinalIgnoreCase));
}