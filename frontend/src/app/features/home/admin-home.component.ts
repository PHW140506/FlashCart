import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  template: `
    <nav style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 2rem;">
      <div style="font-weight: 700; font-size: 1.25rem; color: #1e293b;">FlashCart <span style="font-size: 0.85rem; color: #3b82f6;">(Panel Admin)</span></div>
      <button (click)="logout()" style="background: #ef4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 500;">
        Cerrar sesión
      </button>
    </nav>

    <div style="max-width: 600px; margin: 0 auto; padding: 2rem; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <span style="color: #64748b; font-size: 0.875rem; text-transform: uppercase; font-weight: 600;">Administrador</span>
      <h2 style="margin: 0.5rem 0 1rem 0; color: #0f172a;">Bienvenido, {{ authService.currentSession()?.user?.name?.firstname || 'Admin' }}</h2>
      <p style="color: #475569;">Esta vista representa la interfaz destinada al perfil Administrador.</p>
      
      <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; font-size: 0.9rem;">
        <p><strong>Usuario:</strong> {{ authService.currentSession()?.user?.username }}</p>
        <p><strong>Rol:</strong> {{ authService.currentSession()?.role }}</p>
      </div>
    </div>
  `
})
export class AdminHomeComponent {
  public authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}