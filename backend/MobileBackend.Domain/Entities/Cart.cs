namespace MobileBackend.Domain.Entities;

public class Cart
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public List<CartItem> Items { get; set; } = new();
    public decimal TotalAmount => Items.Sum(x => x.Price * x.Quantity);
}