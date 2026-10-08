namespace FlashCart.Application.DTOs;

/// <summary>
/// Respuesta que la API entrega a Angular después de autenticar al usuario.
/// Reutiliza UserDto para nunca enviar el hash de la contraseña.
/// </summary>
public sealed record LoginResultDto(string Token, UserDto User);
