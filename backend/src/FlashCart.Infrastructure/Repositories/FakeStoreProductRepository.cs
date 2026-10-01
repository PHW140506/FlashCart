using System.Net.Http.Json;
using FlashCart.Application.Interfaces;
using FlashCart.Domain.Entities;
using FlashCart.Infrastructure.External.FakeStore.Models;
using Microsoft.Extensions.Logging;

namespace FlashCart.Infrastructure.Repositories;

public class FakeStoreProductRepository : IProductRepository
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<FakeStoreProductRepository> _logger;

    public FakeStoreProductRepository(HttpClient httpClient, ILogger<FakeStoreProductRepository> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<IReadOnlyList<Product>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Fetching products from Fake Store API...");
            var productsDto = await _httpClient.GetFromJsonAsync<List<FakeStoreProductDto>>(
                "products",
                cancellationToken);

            if (productsDto == null)
            {
                _logger.LogWarning("Fake Store API returned a null product list.");
                return Array.Empty<Product>();
            }

            var products = productsDto.Select(dto => new Product
            {
                Id = dto.Id,
                Title = dto.Title,
                Price = dto.Price,
                Description = dto.Description,
                Category = dto.Category,
                Image = dto.Image,
                Rating = dto.Rating != null ? new ProductRating
                {
                    Rate = dto.Rating.Rate,
                    Count = dto.Rating.Count
                } : null
            }).ToList();

            _logger.LogInformation("Successfully retrieved {Count} products from Fake Store API.", products.Count);
            return products;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error occurred while requesting products from Fake Store API.");
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while fetching products.");
            throw;
        }
    }
}
