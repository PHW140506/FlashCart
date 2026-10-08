using FlashCart.Domain.Entities;

namespace FlashCart.Domain.Interfaces;

public interface ICartRepository
{
    Task<IEnumerable<Cart>> GetAllAsync();
    Task<Cart?> GetByIdAsync(int id);
}