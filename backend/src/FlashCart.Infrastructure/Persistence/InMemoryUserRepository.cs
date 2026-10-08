using FlashCart.Domain.Entities;
using FlashCart.Domain.Interfaces;

namespace FlashCart.Infrastructure.Persistence;

public class InMemoryUserRepository : IUserRepository
{
    private readonly List<User> _users = new()
    {
        new User
        {
            Id = 1,
            Email = "admin@flashcart.com",
            Username = "johndoe",
            Password = "hashed_password_1",
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
            Password = "hashed_password_2",
            Role = "Auditor",
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
            Password = "hashed_password_3",
            Role = "Cliente",
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
        }
    };

    public Task<IEnumerable<User>> GetAllAsync()
    {
        return Task.FromResult<IEnumerable<User>>(_users);
    }

    public Task<User?> GetByIdAsync(int id)
    {
        return Task.FromResult(_users.FirstOrDefault(u => u.Id == id));
    }
}