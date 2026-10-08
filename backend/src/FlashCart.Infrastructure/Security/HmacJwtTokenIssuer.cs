using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using FlashCart.Application.Interfaces;
using FlashCart.Domain.Entities;
using Microsoft.Extensions.Configuration;

namespace FlashCart.Infrastructure.Security;

/// <summary>
/// Genera tokens JWT firmados con HMAC-SHA256 para el prototipo local.
/// Se usa una clave externa al repositorio; NUNCA incluirla en el código.
/// Antes de proteger endpoints es obligatorio implementar validación de firma,
/// emisor, destinatario y expiración mediante middleware de autenticación.
/// </summary>
public sealed class HmacJwtTokenIssuer : IAccessTokenIssuer
{
    private readonly IConfiguration _configuration;

    public HmacJwtTokenIssuer(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string CreateToken(User user)
    {
        // Esta variable debe configurarse en la TERMINAL donde inicia el backend.
        var secret = _configuration["FLASHCART_JWT_SECRET"];
        if (string.IsNullOrWhiteSpace(secret) || Encoding.UTF8.GetByteCount(secret) < 32)
        {
            throw new InvalidOperationException(
                "Configure FLASHCART_JWT_SECRET con al menos 32 bytes para el entorno local.");
        }

        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var header = new { alg = "HS256", typ = "JWT" };
        var payload = new
        {
            // 'sub' identifica al usuario; 'role' permite mapear su perfil.
            sub = user.Id.ToString(CultureInfo.InvariantCulture),
            role = user.Role,
            iss = "FlashCart.Local",
            aud = "FlashCart.Mobile",
            iat = now,
            exp = now + 3600,
            jti = Guid.NewGuid().ToString("N")
        };

        var encodedHeader = Base64UrlEncode(JsonSerializer.SerializeToUtf8Bytes(header));
        var encodedPayload = Base64UrlEncode(JsonSerializer.SerializeToUtf8Bytes(payload));
        var content = $"{encodedHeader}.{encodedPayload}";

        // HMAC permite detectar alteraciones del contenido del token.
        var signature = HMACSHA256.HashData(
            Encoding.UTF8.GetBytes(secret), Encoding.ASCII.GetBytes(content));

        return $"{content}.{Base64UrlEncode(signature)}";
    }

    private static string Base64UrlEncode(byte[] bytes) =>
        Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
}
