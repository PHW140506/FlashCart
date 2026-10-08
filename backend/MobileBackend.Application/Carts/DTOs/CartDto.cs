namespace MobileBackend.Application.Carts.DTOs;

public record CartItemDto(int ProductId, string Title, decimal Price, int Quantity);
public record CartDto(int Id, string UserId, List<CartItemDto> Items, decimal TotalAmount);