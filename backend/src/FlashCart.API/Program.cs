var builder = WebApplication.CreateBuilder(args);

// Agregar soporte para Controladores
builder.Services.AddControllers();

// Configurar CORS para permitir peticiones desde Angular
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

var app = builder.Build();

// Usar CORS
app.UseCors("AllowAngular");

app.UseAuthorization();

app.MapControllers();

app.Run();