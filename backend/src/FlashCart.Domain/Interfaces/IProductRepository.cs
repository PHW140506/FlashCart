using FlashCart.Domain.Entities;

namespace FlashCart.Domain.Interfaces;

public interface IProductRepository
{
    Task<IEnumerable<Product>> GetAllAsync();
    Task<Product?> GetByIdAsync(int id);
    Task<IEnumerable<Product>> GetByCategoryAsync(string category);
    Task<IEnumerable<string>> GetCategoriesAsync();
    Task<Product?> UpdateAsync(Product product);
}