using System.Text;
using FlashCart.Application;
using FlashCart.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Clean Architecture: el punto de entrada configura la inyección de dependencias.
// Domain y Application no conocen los detalles técnicos de la autenticación JWT.
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Mantenemos la misma clave que utiliza HmacJwtTokenIssuer al FIRMAR los tokens.
// Se lee del entorno local: no guardes claves en archivos del repositorio.
var jwtSecret = builder.Configuration["FLASHCART_JWT_SECRET"];
if (string.IsNullOrWhiteSpace(jwtSecret) || Encoding.UTF8.GetByteCount(jwtSecret) < 32)
{
    throw new InvalidOperationException(
        "Configura FLASHCART_JWT_SECRET (mínimo 32 bytes) en la terminal del backend antes de iniciarlo.");
}

// Authentication verifica que el JWT esté firmado con la clave correcta,
// pertenezca a FlashCart y no haya caducado. No confíes solo en Angular guards.
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Mantiene las claims "sub" y "role" tal como fueron emitidas.
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            RequireSignedTokens = true,
            ValidateIssuer = true,
            ValidIssuer = "FlashCart.Local",
            ValidateAudience = true,
            ValidAudience = "FlashCart.Mobile",
            ValidateLifetime = true,
            RequireExpirationTime = true,
            // Sin margen adicional: una vez vencido, el token debe rechazarse.
            ClockSkew = TimeSpan.Zero,
            ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
            NameClaimType = "sub",
            RoleClaimType = "role"
        };
    });

// Authorization permite activar [Authorize] y reglas por rol en endpoints.
builder.Services.AddAuthorization();

// La aplicación Angular local podrá comunicarse con la API en desarrollo.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAngular");
app.UseHttpsRedirection();

// El orden sí importa: autenticar ANTES de autorizar.
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
