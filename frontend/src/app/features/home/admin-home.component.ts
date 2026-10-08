import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

/**
 * Features/Home: esta vista solo presenta la información del Administrador.
 * US02 muestra el botón de salida en App (menú compartido), así evitamos
 * duplicar el botón y la lógica de cierre entre los tres perfiles.
 */
@Component({
  selector: 'app-admin-home',
  standalone: true,
  template: `
    <section style="max-width: 600px; margin: 2rem auto; padding: 2rem; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px -1 rgba(0,0,0,0.1);">
      <span style="color: #64748b; font-size: 0.875rem; text-transform: uppercase; font-weight: 600;">Administrador</span>
      <h2 style="margin: 0.5rem 0 1rem 0; color: #0f172a;">Bienvenido, {{ authService.currentSession()?.user?.fullName || 'Admin' }}</h2>
      <p style="color: #475569;">Esta vista representa la interfaz destinada al perfil Administrador.</p>

      <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; font-size: 0.9rem;">
        <p><strong>Usuario:</strong> {{ authService.currentSession()?.user?.username }}</p>
        <p><strong>Rol:</strong> {{ authService.currentSession()?.role }}</p>
      </div>
    </section>
  `,
})
export class AdminHomeComponent {
  readonly authService = inject(AuthService);
}
