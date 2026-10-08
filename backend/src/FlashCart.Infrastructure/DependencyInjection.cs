using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using FlashCart.Application.Interfaces;
using FlashCart.Domain.Interfaces;
using FlashCart.Infrastructure.Persistence;
using FlashCart.Infrastructure.Security;

namespace FlashCart.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Usamos la interfaz de Domain para evitar la ambigüedad con Application.
        // InMemoryProductRepository implementa el contrato de Domain.
        services.AddSingleton<FlashCart.Domain.Interfaces.IProductRepository, InMemoryProductRepository>();

        // Domain define contratos; Infrastructure proporciona las implementaciones.
        // La misma instancia atiende consultas de usuarios y verificación de login.
        services.AddSingleton<InMemoryUserRepository>();
        services.AddSingleton<IUserRepository>(
            provider => provider.GetRequiredService<InMemoryUserRepository>());
        services.AddSingleton<IUserCredentialVerifier, InMemoryUserCredentialVerifier>();

        // Cuando el Handler pide IAccessTokenIssuer, DI crea el emisor JWT.
        // La clave se obtiene de IConfiguration (variables de entorno).
        services.AddSingleton<IAccessTokenIssuer, HmacJwtTokenIssuer>();

        services.AddSingleton<ICartRepository, InMemoryCartRepository>();
        return services;
    }
}
