import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cart-container" style="padding: 20px;">
      <h2>Tu Carrito de Compras</h2>

      <div *ngIf="cartService.cart()?.items?.length === 0" class="empty-cart">
        <p>Tu carrito está vacío, explora el catálogo.</p>
      </div>

      <div *ngIf="cartService.cart()?.items?.length! > 0">
        <ul>
          <li *ngFor="let item of cartService.cart()?.items">
            {{ item.title }} - Cantidad: {{ item.quantity }} - Precio: {{ item.price | currency }}
          </li>
        </ul>
        <h3>Total: {{ cartService.cart()?.totalAmount | currency }}</h3>
        <button [disabled]="cartService.cart()?.items?.length === 0">Proceder al pago</button>
      </div>
    </div>
  `
})
export class CartComponent implements OnInit {
  constructor(public cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.getCart('cliente1').subscribe();
  }
}
