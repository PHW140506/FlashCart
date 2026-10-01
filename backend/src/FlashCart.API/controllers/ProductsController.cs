using Microsoft.AspNetCore.Mvc;

namespace FlashCart.API.Controllers
{
    [ApiController]
    [Route("products")]
    public class ProductsController : ControllerBase
    {
        private static readonly List<ProductDto> Products = new()
        {
            new ProductDto { Id = 1, Title = "Laptop Gamer", Price = 1200, Category = "Electronics", Description = "Laptop de alto rendimiento", Image = "https://via.placeholder.com/150" },
            new ProductDto { Id = 2, Title = "Camiseta Deportiva", Price = 30, Category = "Clothing", Description = "100% Algodón", Image = "https://via.placeholder.com/150" },
            new ProductDto { Id = 3, Title = "Audífonos Bluetooth", Price = 80, Category = "Electronics", Description = "Cancelación de ruido", Image = "https://via.placeholder.com/150" },
            new ProductDto { Id = 4, Title = "Pantalón Jean", Price = 45, Category = "Clothing", Description = "Corte clásico", Image = "https://via.placeholder.com/150" }
        };

        // GET /products
        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(Products);
        }

        // GET /products/categories
        [HttpGet("categories")]
        public IActionResult GetCategories()
        {
            var categories = Products.Select(p => p.Category).Distinct();
            return Ok(categories);
        }

        // GET /products/category/{category}
        [HttpGet("category/{category}")]
        public IActionResult GetByCategory(string category)
        {
            var filtered = Products.Where(p => p.Category.Equals(category, System.StringComparison.OrdinalIgnoreCase));
            return Ok(filtered);
        }
    }

    public class ProductDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
    }
}