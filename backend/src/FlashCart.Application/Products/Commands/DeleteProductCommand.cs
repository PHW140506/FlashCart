using FlashCart.Domain.Interfaces;
using MediatR;

namespace FlashCart.Application.Products.Commands;

public sealed record DeleteProductCommand(int Id) : IRequest<bool>;

public sealed class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, bool>
{
    private readonly IProductRepository _repository;

    public DeleteProductCommandHandler(IProductRepository repository) => _repository = repository;

    public async Task<bool> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        return request.Id > 0 && await _repository.DeleteAsync(request.Id);
    }
}
