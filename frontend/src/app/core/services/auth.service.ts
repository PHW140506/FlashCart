import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { UserSession, UserRole } from '../models/auth.model';
import { CartService } from './cart.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private cartService = inject(CartService);

  private readonly STORAGE_KEY = 'flashcart_session';

  // Estado reactivo en memoria
  private currentSessionSignal = signal<UserSession | null>(this.getStoredSession());

  public currentSession = this.currentSessionSignal.asReadonly();
  public isAuthenticated = computed(() => this.currentSessionSignal() !== null);
  public userRole = computed(() => this.currentSessionSignal()?.role ?? null);

  private getStoredSession(): UserSession | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Criterio de Aceptación US02:
   * 1. Elimina token y rol del almacenamiento persistente (localStorage).
   * 2. Limpieza profunda en memoria (sesión y carrito).
   * 3. Redirige a /login reemplazando el historial (replaceUrl: true).
   */
  public logout(): void {
    // 1. Limpieza persistente
    localStorage.removeItem(this.STORAGE_KEY);

    // 2. Limpieza profunda en memoria
    this.currentSessionSignal.set(null);
    this.cartService.clearCart();

    // 3. Redirección destruyendo la entrada previa en el historial
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  // Método auxiliar para pruebas y simular login (US01)
  public setSession(session: UserSession): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    this.currentSessionSignal.set(session);
  }
}