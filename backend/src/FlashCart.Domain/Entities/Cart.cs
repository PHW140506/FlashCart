namespace FlashCart.Domain.Entities;

public class CartItem
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class Cart
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateTime Date { get; set; }
    public List<CartItem> Products { get; set; } = new();
}