using FlashCart.Domain.Entities;

namespace FlashCart.Domain.Interfaces;

/// <summary>
/// Contrato para validar credenciales sin exponer al caso de uso
/// los detalles de persistencia o del algoritmo de hash.
/// </summary>
public interface IUserCredentialVerifier
{
    Task<User?> VerifyAsync(
        string username,
        string password,
        CancellationToken cancellationToken = default);
}
