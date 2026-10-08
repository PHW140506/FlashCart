using FlashCart.Domain.Entities;
using FlashCart.Domain.Interfaces;

namespace FlashCart.Infrastructure.Persistence;

/// <summary>
/// Verifica las credenciales de usuarios sembrados en memoria.
/// La consulta de usuarios y la verificación de contraseñas
/// mantienen contratos separados.
/// </summary>
public sealed class InMemoryUserCredentialVerifier : IUserCredentialVerifier
{
    private readonly InMemoryUserRepository _users;

    public InMemoryUserCredentialVerifier(InMemoryUserRepository users)
    {
        _users = users;
    }

    public async Task<User?> VerifyAsync(
        string username,
        string password,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrEmpty(password))
        {
            return null;
        }

        var user = await _users.FindByUsernameAsync(username.Trim());
        if (user is null || !DemoPasswordHasher.Verify(password, user.Password))
        {
            return null;
        }

        return user;
    }
}
