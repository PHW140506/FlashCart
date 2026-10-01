using FlashCart.Application.Interfaces;

namespace FlashCart.API.Endpoints;

public static class ProductEndpoints
{
    public static IEndpointRouteBuilder MapProductEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/products", async (IProductService productService, CancellationToken cancellationToken) =>
        {
            var products = await productService.GetAllProductsAsync(cancellationToken);
            return Results.Ok(products);
        })
        .WithName("GetProducts")
        .WithDescription("Retrieves the full catalog of products from the store")
        .Produces(StatusCodes.Status200OK);

        return app;
    }
}
