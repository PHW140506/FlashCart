import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Cart } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly cartsUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.carts}`;

  // Estado del carrito de la sesión local
  private readonly currentCart = signal<any[]>([]);

  /**
   * Obtiene el histórico global de carritos desde el backend local (.NET)
   */
  getCarts(): Observable<Cart[]> {
    return this.http.get<Cart[]>(this.cartsUrl);
  }

  /**
   * Limpia el carrito de la sesión activa al cerrar sesión
   */
  clearCart(): void {
    this.currentCart.set([]);
  }
}