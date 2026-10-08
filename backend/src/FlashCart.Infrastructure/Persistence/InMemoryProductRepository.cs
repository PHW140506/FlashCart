using FlashCart.Domain.Entities;
using FlashCart.Domain.Interfaces;

namespace FlashCart.Infrastructure.Persistence;

/// <summary>
/// Repositorio singleton y local. Se sincroniza para evitar colisiones de IDs,
/// lecturas inconsistentes y modificaciones concurrentes de la lista.
/// Los datos de prueba se reinician al detener el proceso.
/// </summary>
public sealed class InMemoryProductRepository : IProductRepository
{
    private readonly object _sync = new();
    private int _nextId = 5;
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

    public Task<IEnumerable<Product>> GetAllAsync()
    {
        lock (_sync)
            return Task.FromResult<IEnumerable<Product>>(_products.Select(Copy).ToArray());
    }

    public Task<Product?> GetByIdAsync(int id)
    {
        lock (_sync)
            return Task.FromResult(_products.Where(p => p.Id == id).Select(Copy).FirstOrDefault());
    }

    public Task<IEnumerable<Product>> GetByCategoryAsync(string category)
    {
        lock (_sync)
            return Task.FromResult<IEnumerable<Product>>(_products
                .Where(p => p.Category.Equals(category, StringComparison.OrdinalIgnoreCase))
                .Select(Copy).ToArray());
    }

    public Task<IEnumerable<string>> GetCategoriesAsync()
    {
        lock (_sync)
            return Task.FromResult<IEnumerable<string>>(_products
                .Select(p => p.Category).Distinct(StringComparer.OrdinalIgnoreCase).ToArray());
    }

    public Task<Product> CreateAsync(Product product)
    {
        lock (_sync)
        {
            var stored = Copy(product);
            stored.Id = _nextId++;
            _products.Add(stored);
            return Task.FromResult(Copy(stored));
        }
    }

    public Task<Product?> UpdateAsync(Product product)
    {
        lock (_sync)
        {
            var index = _products.FindIndex(p => p.Id == product.Id);
            if (index < 0) return Task.FromResult<Product?>(null);

            // Las valoraciones no forman parte del formulario de inventario.
            var existing = _products[index];
            var updated = Copy(product);
            updated.RatingRate = existing.RatingRate;
            updated.RatingCount = existing.RatingCount;
            _products[index] = updated;
            return Task.FromResult<Product?>(Copy(updated));
        }
    }

    public Task<bool> DeleteAsync(int id)
    {
        lock (_sync)
        {
            var index = _products.FindIndex(p => p.Id == id);
            if (index < 0) return Task.FromResult(false);
            _products.RemoveAt(index);
            return Task.FromResult(true);
        }
    }

    private static Product Copy(Product p) => new()
    {
        Id = p.Id, Title = p.Title, Price = p.Price,
        Description = p.Description, Category = p.Category,
        Image = p.Image, RatingRate = p.RatingRate, RatingCount = p.RatingCount
    };
}
