namespace FlashCart.Application.DTOs;

// Contrato de alta y edición: el cliente no elige el ID ni la valoración.
public sealed record ProductInputDto(
    string Title,
    decimal Price,
    string Description,
    string Category,
    string Image);
