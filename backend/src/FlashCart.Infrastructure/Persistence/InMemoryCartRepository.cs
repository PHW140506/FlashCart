using FlashCart.Domain.Entities;
using FlashCart.Domain.Interfaces;

namespace FlashCart.Infrastructure.Persistence;

public class InMemoryCartRepository : ICartRepository
{
    private readonly List<Cart> _carts = new()
    {
        new Cart
        {
            Id = 1,
            UserId = 1,
            Date = DateTime.UtcNow.AddDays(-3),
            Products = new List<CartItem>
            {
                new() { ProductId = 1, Quantity = 1 }, // Laptop Gamer Pro
                new() { ProductId = 2, Quantity = 2 }  // Audífonos Bluetooth Wireless
            }
        },
        new Cart
        {
            Id = 2,
            UserId = 2,
            Date = DateTime.UtcNow.AddDays(-1),
            Products = new List<CartItem>
            {
                new() { ProductId = 3, Quantity = 3 }, // Camiseta Casual
                new() { ProductId = 4, Quantity = 1 }  // Mochila Ergonómica
            }
        },
        new Cart
        {
            Id = 3,
            UserId = 3,
            Date = DateTime.UtcNow.AddHours(-5),
            Products = new List<CartItem>
            {
                new() { ProductId = 2, Quantity = 1 },
                new() { ProductId = 4, Quantity = 2 }
            }
        }
    };

    public Task<IEnumerable<Cart>> GetAllAsync()
    {
        return Task.FromResult<IEnumerable<Cart>>(_carts);
    }

    public Task<Cart?> GetByIdAsync(int id)
    {
        return Task.FromResult(_carts.FirstOrDefault(c => c.Id == id));
    }
}