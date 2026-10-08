using FlashCart.Application.DTOs;
using FlashCart.Domain.Entities;

namespace FlashCart.Application.Products.Commands;

// El caso de uso expresa éxito, validación o ausencia sin conocer ASP.NET Core.
public sealed record ProductWriteResult(ProductDto? Product, string? Error = null, bool NotFound = false)
{
    public static ProductWriteResult From(Product p) => new(new ProductDto
    {
        Id = p.Id, Title = p.Title, Price = p.Price,
        Description = p.Description, Category = p.Category,
        Image = p.Image, RatingRate = p.RatingRate, RatingCount = p.RatingCount
    });
}
