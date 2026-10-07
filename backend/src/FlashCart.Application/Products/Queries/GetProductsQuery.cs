using MediatR;
using FlashCart.Application.DTOs;
using FlashCart.Domain.Interfaces;

namespace FlashCart.Application.Products.Queries;

public record GetProductsQuery(string? Category = null) : IRequest<IEnumerable<ProductDto>>;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, IEnumerable<ProductDto>>
{
    private readonly IProductRepository _repository;

    public GetProductsQueryHandler(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ProductDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var products = string.IsNullOrWhiteSpace(request.Category)
            ? await _repository.GetAllAsync()
            : await _repository.GetByCategoryAsync(request.Category);

        return products.Select(p => new ProductDto
        {
            Id = p.Id,
            Title = p.Title,
            Price = p.Price,
            Description = p.Description,
            Category = p.Category,
            Image = p.Image,
            RatingRate = p.RatingRate,
            RatingCount = p.RatingCount
        });
    }
}