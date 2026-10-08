using MediatR;
using FlashCart.Application.DTOs;
using FlashCart.Domain.Interfaces;

namespace FlashCart.Application.Carts.Queries;

public record GetCartsQuery : IRequest<IEnumerable<CartDto>>;

public class GetCartsQueryHandler : IRequestHandler<GetCartsQuery, IEnumerable<CartDto>>
{
    private readonly ICartRepository _cartRepository;
    private readonly IProductRepository _productRepository;
    private readonly IUserRepository _userRepository;

    public GetCartsQueryHandler(
        ICartRepository cartRepository,
        IProductRepository productRepository,
        IUserRepository userRepository)
    {
        _cartRepository = cartRepository;
        _productRepository = productRepository;
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<CartDto>> Handle(GetCartsQuery request, CancellationToken cancellationToken)
    {
        var carts = await _cartRepository.GetAllAsync();
        var products = (await _productRepository.GetAllAsync()).ToDictionary(p => p.Id);
        var users = (await _userRepository.GetAllAsync()).ToDictionary(u => u.Id);

        var result = new List<CartDto>();

        foreach (var cart in carts)
        {
            var customerName = users.TryGetValue(cart.UserId, out var user)
                ? $"{user.Name.Firstname} {user.Name.Lastname}".Trim()
                : $"Usuario #{cart.UserId}";

            var itemDetails = new List<CartItemDetailDto>();

            foreach (var item in cart.Products)
            {
                var title = products.TryGetValue(item.ProductId, out var prod) ? prod.Title : $"Producto #{item.ProductId}";
                var price = prod?.Price ?? 0m;

                itemDetails.Add(new CartItemDetailDto
                {
                    ProductId = item.ProductId,
                    ProductTitle = title,
                    UnitPrice = price,
                    Quantity = item.Quantity
                });
            }

            result.Add(new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId,
                CustomerName = customerName,
                Date = cart.Date,
                TotalAmount = itemDetails.Sum(i => i.Subtotal),
                Products = itemDetails
            });
        }

        return result;
    }
}