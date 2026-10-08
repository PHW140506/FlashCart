using MediatR;
using MobileBackend.Application.Carts.DTOs;
using MobileBackend.Domain.Entities;
using MobileBackend.Domain.Interfaces;

namespace MobileBackend.Application.Carts.Commands;

public record AddToCartCommand(string UserId, int ProductId, string Title, decimal Price, int Quantity) : IRequest<CartDto>;

public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, CartDto>
{
    private readonly ICartRepository _cartRepository;

    public AddToCartCommandHandler(ICartRepository cartRepository)
    {
        _cartRepository = cartRepository;
    }

    public async Task<CartDto> Handle(AddToCartCommand request, CancellationToken cancellationToken)
    {
        var item = new CartItem
        {
            ProductId = request.ProductId,
            Title = request.Title,
            Price = request.Price,
            Quantity = request.Quantity
        };

        var cart = await _cartRepository.AddItemAsync(request.UserId, item);

        return new CartDto(
            cart.Id,
            cart.UserId,
            cart.Items.Select(i => new CartItemDto(i.ProductId, i.Title, i.Price, i.Quantity)).ToList(),
            cart.TotalAmount
        );
    }
}