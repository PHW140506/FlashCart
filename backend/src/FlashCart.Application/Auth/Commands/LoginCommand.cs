using FlashCart.Application.DTOs;
using FlashCart.Application.Interfaces;
using FlashCart.Domain.Interfaces;
using MediatR;

namespace FlashCart.Application.Auth.Commands;

/// <summary>
/// Command de CQRS: los datos del formulario llegan aquí desde AuthController.
/// El Handler decide si las credenciales son correctas, sin acceder a HTTP.
/// </summary>
public sealed record LoginCommand(string Username, string Password) : IRequest<LoginResultDto?>;

public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResultDto?>
{
    private readonly IUserCredentialVerifier _credentialVerifier;
    private readonly IAccessTokenIssuer _tokenIssuer;

    public LoginCommandHandler(
        IUserCredentialVerifier credentialVerifier,
        IAccessTokenIssuer tokenIssuer)
    {
        // DIP: recibimos interfaces; Infrastructure provee las implementaciones.
        _credentialVerifier = credentialVerifier;
        _tokenIssuer = tokenIssuer;
    }

    public async Task<LoginResultDto?> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // No intentamos iniciar sesión si faltan datos.
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return null;
        }

        // Infrastructure comprueba el usuario y su contraseña de forma segura.
        var user = await _credentialVerifier.VerifyAsync(
            request.Username, request.Password, cancellationToken);

        if (user is null)
        {
            return null; // AuthController transformará este resultado en HTTP 401.
        }

        // Infrastructure emite el token firmado. Nunca regresamos la contraseña.
        var token = _tokenIssuer.CreateToken(user);
        var userDto = new UserDto
        {
            Id = user.Id,
            FullName = $"{user.Name.Firstname} {user.Name.Lastname}".Trim(),
            Username = user.Username,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role,
            Address = new AddressDto
            {
                City = user.Address.City,
                Street = user.Address.Street,
                Number = user.Address.Number,
                Zipcode = user.Address.Zipcode
            }
        };

        // Angular recibirá { token, user } desde POST /api/auth/login.
        return new LoginResultDto(token, userDto);
    }
}
