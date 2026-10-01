using FlashCart.Application.Interfaces;
using FlashCart.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace FlashCart.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();
        return services;
    }
}
