namespace FlashCart.Infrastructure.Configuration;

public class FakeStoreApiOptions
{
    public const string SectionName = "FakeStoreApi";

    public string BaseUrl { get; set; } = "https://fakestoreapi.com";
    public int TimeoutSeconds { get; set; } = 15;
}
