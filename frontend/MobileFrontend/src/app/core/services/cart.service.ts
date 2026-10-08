import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Cart, CartItem } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:5178/api/carts';

  public cart = signal<Cart | null>(null);

  constructor(private http: HttpClient) {}

  getCart(userId: string): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/${userId}`).pipe(
      tap(cartData => this.cart.set(cartData))
    );
  }

  addToCart(userId: string, item: CartItem): Observable<Cart> {
    const payload = {
      userId,
      productId: item.productId,
      title: item.title,
      price: item.price,
      quantity: item.quantity
    };
    return this.http.post<Cart>(this.apiUrl, payload).pipe(
      tap(cartData => this.cart.set(cartData))
    );
  }
}
