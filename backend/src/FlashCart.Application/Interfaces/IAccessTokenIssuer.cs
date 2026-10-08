using FlashCart.Domain.Entities;

namespace FlashCart.Application.Interfaces;

/// <summary>
/// Application solicita un token mediante esta interfaz.
/// Infrastructure decide cómo crearlo; Application no conoce detalles de JWT.
/// </summary>
public interface IAccessTokenIssuer
{
    string CreateToken(User user);
}
