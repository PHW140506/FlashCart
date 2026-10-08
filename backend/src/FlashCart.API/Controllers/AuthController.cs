using FlashCart.Application.Auth.Commands;
using FlashCart.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlashCart.API.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // El login debe ser público: todavía no se dispone de un token.
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResultDto>> Login(
        [FromBody] LoginCommand command,
        CancellationToken cancellationToken)
    {
        // Thin Controller: HTTP -> MediatR -> Handler; no verifica contraseñas aquí.
        var result = await _mediator.Send(command, cancellationToken);

        if (result is null)
        {
            return Unauthorized(new { message = "Usuario o contraseña inválidos" });
        }

        return Ok(result);
    }

    // Endpoint de prueba para verificar que el middleware RECHAZA tokens
    // inexistentes, caducados, alterados o firmados con otra clave.
    // No realiza lógica de negocio: [Authorize] valida la petición antes de entrar.
    [Authorize]
    [HttpGet("validate")]
    public IActionResult ValidateToken()
    {
        // HTTP 204 confirma una identidad autenticada sin exponer datos sensibles.
        return NoContent();
    }
}
