import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-client-home',
  standalone: true,
  template: `
    <main class="page">
      <section class="card">
        <p class="role">Cliente</p>
        <h1>Bienvenido, {{ authService.currentSession()?.user?.name?.firstname }}</h1>
        <p>Esta vista representa la interfaz destinada al perfil Cliente.</p>
        <dl>
          <div>
            <dt>Usuario</dt>
            <dd>{{ authService.currentSession()?.user?.username }}</dd>
          </div>
          <div>
            <dt>Rol</dt>
            <dd>{{ authService.currentSession()?.role }}</dd>
          </div>
        </dl>
      </section>
    </main>
  `,
  styles: [`
    .page { min-height: 100dvh; display: grid; place-items: center; padding: 24px; background: #f4f7fb; }
    .card { width: min(100%, 720px); box-sizing: border-box; padding: 32px; border-radius: 18px; background: white; box-shadow: 0 14px 40px rgba(24,39,75,.12); }
    .role { color: #1f4f8f; font-weight: 800; }
    h1 { margin: 8px 0 12px; }
    dl { display: grid; gap: 12px; margin-top: 24px; }
    dl div { display: grid; grid-template-columns: 110px 1fr; }
    dt { color: #667085; }
    dd { margin: 0; font-weight: 650; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHomeComponent {
  readonly authService = inject(AuthService);
}
