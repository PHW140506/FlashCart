import { Injectable, signal } from '@angular/core';

export interface CartItemSummary {
  productId: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Estado reactivo en memoria con Signals
  private cartItemsSignal = signal<CartItemSummary[]>([]);
  public cartItems = this.cartItemsSignal.asReadonly();

  // Escenario 3: Limpieza profunda de memoria
  public clearCart(): void {
    this.cartItemsSignal.set([]);
  }

  // Métodos auxiliares para simulación
  public setCart(items: CartItemSummary[]): void {
    this.cartItemsSignal.set(items);
  }
}