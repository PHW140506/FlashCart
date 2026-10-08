using MobileBackend.Domain.Entities;

namespace MobileBackend.Domain.Interfaces;

public interface ICartRepository
{
    Task<Cart> GetByUserIdAsync(string userId);
    Task<Cart> AddItemAsync(string userId, CartItem item);
    Task<Cart> UpdateItemQuantityAsync(string userId, int productId, int quantity);
    Task<Cart> RemoveItemAsync(string userId, int productId);
}