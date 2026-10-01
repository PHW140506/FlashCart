import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div style="padding: 2rem; max-width: 400px; margin: auto; text-align: center;">
      <h2>Pantalla de Login</h2>
      <p>Simulación de credenciales para probar flujo de sesión.</p>
      
      <button (click)="simulateLogin('Administrador')" style="margin: 5px; padding: 8px 16px;">
        Entrar como Admin
      </button>
      <button (click)="simulateLogin('Cliente')" style="margin: 5px; padding: 8px 16px;">
        Entrar como Cliente
      </button>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);

  simulateLogin(role: 'Administrador' | 'Cliente'): void {
    // 1. Simula datos de sesión
    this.authService.setSession({
      id: role === 'Administrador' ? 1 : 4,
      username: role.toLowerCase(),
      email: `${role.toLowerCase()}@flashcart.com`,
      role: role,
      token: 'mock-jwt-token-xyz'
    });

    // 2. Simula artículos en carrito
    this.cartService.setCart([
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 }
    ]);

    // 3. Navega al catálogo protegido
    this.router.navigate(['/home']);
  }
}