using MediatR;
using FlashCart.Application.DTOs;
using FlashCart.Domain.Interfaces;

namespace FlashCart.Application.Users.Queries;

public record GetUsersQuery : IRequest<IEnumerable<UserDto>>;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, IEnumerable<UserDto>>
{
    private readonly IUserRepository _userRepository;

    public GetUsersQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllAsync();

        return users.Select(u => new UserDto
        {
            Id = u.Id,
            FullName = $"{u.Name.Firstname} {u.Name.Lastname}".Trim(),
            Username = u.Username,
            Email = u.Email,
            Phone = u.Phone,
            Role = u.Role,
            Address = new AddressDto
            {
                City = u.Address.City,
                Street = u.Address.Street,
                Number = u.Address.Number,
                Zipcode = u.Address.Zipcode
            }
        });
    }
}