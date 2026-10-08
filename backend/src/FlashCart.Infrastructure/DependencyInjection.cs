using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using FlashCart.Domain.Interfaces;
using FlashCart.Infrastructure.Persistence;

namespace FlashCart.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services, 
        IConfiguration configuration)
    {
        services.AddSingleton<IProductRepository, InMemoryProductRepository>();
        services.AddSingleton<IUserRepository, InMemoryUserRepository>();
        services.AddSingleton<ICartRepository, InMemoryCartRepository>();
        return services;
    }
}