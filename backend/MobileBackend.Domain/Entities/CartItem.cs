namespace MobileBackend.Domain.Entities;

public class CartItem
{
    public int ProductId { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}