import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService } from '../../core/services/cart.service';
import { Cart } from '../../core/models/cart.model';

@Component({
  selector: 'app-carts',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './carts.component.html',
  styleUrl: './carts.component.scss'
})
export class CartsComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);

  readonly carts = signal<Cart[]>([]);
  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly expandedCartId = signal<number | null>(null);

  ngOnInit(): void {
    this.fetchCarts();
  }

  fetchCarts(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.cartService.getCarts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.carts.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error al cargar carritos:', err);
          this.errorMessage.set('No se pudo establecer conexión con el backend local.');
          this.loading.set(false);
        }
      });
  }

  toggleExpand(cartId: number): void {
    this.expandedCartId.update(current => (current === cartId ? null : cartId));
  }
}