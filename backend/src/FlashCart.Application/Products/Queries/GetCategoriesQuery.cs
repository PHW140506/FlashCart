using MediatR;
using FlashCart.Domain.Interfaces;

namespace FlashCart.Application.Products.Queries;

public record GetCategoriesQuery : IRequest<IEnumerable<string>>;

public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, IEnumerable<string>>
{
    private readonly IProductRepository _productRepository;

    public GetCategoriesQueryHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<IEnumerable<string>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        return await _productRepository.GetCategoriesAsync();
    }
}