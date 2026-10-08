import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';

/**
 * App es la capa visual principal de Angular (shell).
 * Muestra el menú de sesión en todas las pantallas cuando hay un usuario activo.
 * No borra tokens directamente: esa responsabilidad pertenece a AuthService (Core).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'FlashCart';

  private readonly authService = inject(AuthService);

  // AuthService comparte la misma sesión con el login y los Guards.
  readonly session = this.authService.currentSession;
  readonly closingSession = signal(false);
  readonly logoutError = signal<string | null>(null);

  async logout(): Promise<void> {
    // Evita que dos pulsaciones ejecuten el cierre de sesión a la vez.
    if (this.closingSession()) return;
    this.closingSession.set(true);
    this.logoutError.set(null);

    try {
      // Core -> almacenamiento seguro -> carrito -> navegación al login.
      // Los Guards bloquean el regreso a pantallas privadas después del cierre.
      await this.authService.logout();
    } catch {
      // No mostramos una salida exitosa si falló el borrado persistente.
      this.logoutError.set(
        'No fue posible borrar la sesión del dispositivo. Intenta cerrar sesión nuevamente.',
      );
    } finally {
      this.closingSession.set(false);
    }
  }
}