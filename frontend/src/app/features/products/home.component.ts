import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <nav style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #eee;">
      <h3>FlashCart - Catálogo</h3>
      <div>
        <span>Usuario: <strong>{{ authService.currentSession()?.username }}</strong> ({{ authService.userRole() }})</span>
        <button (click)="onLogout()" style="margin-left: 15px; padding: 6px 12px; background: #d9534f; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Cerrar sesión
        </button>
      </div>
    </nav>

    <div style="padding: 2rem;">
      <h4>Estado en memoria</h4>
      <p>Artículos en el carrito activo: <strong>{{ cartService.cartItems().length }}</strong></p>
      <ul>
        @for (item of cartService.cartItems(); track item.productId) {
          <li>Producto ID: {{ item.productId }} - Cantidad: {{ item.quantity }}</li>
        }
      </ul>
    </div>
  `
})
export class HomeComponent {
  public authService = inject(AuthService);
  public cartService = inject(CartService);

  onLogout(): void {
    this.authService.logout();
  }
}