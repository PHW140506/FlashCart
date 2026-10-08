using FlashCart.Domain.Entities;
using FlashCart.Domain.Interfaces;

namespace FlashCart.Infrastructure.Persistence;

public class InMemoryUserRepository : IUserRepository
{
    // Usuarios en memoria de la base oficial; se mantienen sus identificadores
    // y datos de contacto. El rol se calcula de acuerdo con US01.
    private readonly List<User> _users = new()
    {
        new User
        {
            Id = 1,
            Email = "admin@flashcart.com",
            Username = "johndoe",
            Role = "Administrador",
            Phone = "1-570-555-0129",
            Name = new UserName { Firstname = "John", Lastname = "Doe" },
            Address = new Address
            {
                City = "San Juan del Río",
                Street = "Av. Central",
                Number = 120,
                Zipcode = "76800",
                Geolocation = new AddressGeolocation { Lat = "20.3889", Long = "-99.9961" }
            }
        },
        new User
        {
            Id = 2,
            Email = "auditor@flashcart.com",
            Username = "morrison",
            Role = "Administrador",
            Phone = "1-570-555-0144",
            Name = new UserName { Firstname = "David", Lastname = "Morrison" },
            Address = new Address
            {
                City = "Querétaro",
                Street = "Paseo de la República",
                Number = 45,
                Zipcode = "76100",
                Geolocation = new AddressGeolocation { Lat = "20.5888", Long = "-100.3899" }
            }
        },
        new User
        {
            Id = 3,
            Email = "customer@flashcart.com",
            Username = "kevinryan",
            Role = "Auditor",
            Phone = "1-570-555-0182",
            Name = new UserName { Firstname = "Kevin", Lastname = "Ryan" },
            Address = new Address
            {
                City = "Tequisquiapan",
                Street = "Calle Hidalgo",
                Number = 12,
                Zipcode = "76750",
                Geolocation = new AddressGeolocation { Lat = "20.5211", Long = "-99.8912" }
            }
        },
        // Cuarto usuario para comprobar el escenario del perfil Cliente.
        new User
        {
            Id = 4,
            Email = "cliente4@flashcart.local",
            Username = "cliente4",
            Role = "Cliente",
            Phone = "",
            Name = new UserName { Firstname = "Cliente", Lastname = "Prueba" },
            Address = new Address
            {
                City = "San Juan del Río",
                Street = "",
                Number = 0,
                Zipcode = "76800"
            }
        }
    };

    public InMemoryUserRepository()
    {
        // Contraseña de desarrollo proporcionada SOLO mediante variable de entorno.
        // En ausencia de la variable no se activa el inicio de sesión de prueba.
        // El repositorio nunca contiene una contraseña de prueba en texto plano.
        var demoPassword = Environment.GetEnvironmentVariable("FLASHCART_DEMO_PASSWORD");

        foreach (var user in _users)
        {
            user.Role = user.Id switch
            {
                1 or 2 => "Administrador",
                3 => "Auditor",
                _ => "Cliente"
            };

            user.Password = !string.IsNullOrWhiteSpace(demoPassword)
                ? DemoPasswordHasher.Hash(demoPassword)
                : string.Empty;
        }
    }

    public Task<IEnumerable<User>> GetAllAsync()
    {
        return Task.FromResult<IEnumerable<User>>(_users);
    }

    public Task<User?> GetByIdAsync(int id)
    {
        return Task.FromResult(_users.FirstOrDefault(u => u.Id == id));
    }

    internal Task<User?> FindByUsernameAsync(string username)
    {
        return Task.FromResult(
            _users.FirstOrDefault(u =>
                string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase)));
    }
}
