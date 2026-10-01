using FlashCart.Application.Interfaces;
using FlashCart.Infrastructure.Configuration;
using FlashCart.Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FlashCart.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<FakeStoreApiOptions>(
            configuration.GetSection(FakeStoreApiOptions.SectionName));

        var options = configuration
            .GetSection(FakeStoreApiOptions.SectionName)
            .Get<FakeStoreApiOptions>() ?? new FakeStoreApiOptions();

        services.AddHttpClient<IProductRepository, FakeStoreProductRepository>(client =>
        {
            var baseUrl = options.BaseUrl.TrimEnd('/') + "/";
            client.BaseAddress = new Uri(baseUrl);
            client.Timeout = TimeSpan.FromSeconds(options.TimeoutSeconds);
            client.DefaultRequestHeaders.Add("Accept", "application/json");
        });

        return services;
    }
}
