namespace FlashCart.Application.Products.Commands;

// Las reglas se ejecutan en Application, incluso si se omite el formulario Angular.
internal static class ProductWriteValidator
{
    public static string? Validate(
        string? title, decimal price, string? description, string? category, string? image)
    {
        if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(description) ||
            string.IsNullOrWhiteSpace(category) || string.IsNullOrWhiteSpace(image))
            return "Título, descripción, categoría e imagen son obligatorios.";

        if (price <= 0)
            return "El precio debe ser mayor que cero.";

        if (title.Trim().Length > 150 || category.Trim().Length > 100 ||
            description.Trim().Length > 2000 || image.Trim().Length > 2048)
            return "Uno de los campos supera la longitud permitida.";

        if (!Uri.TryCreate(image.Trim(), UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps) ||
            string.IsNullOrWhiteSpace(uri.Host))
            return "La imagen debe tener una URL HTTP o HTTPS válida.";

        return null;
    }
}
