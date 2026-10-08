import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthFlowError } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Features/Auth: solo gestiona formulario, mensajes y navegación.
 * Toda la lógica de autenticación está en AuthService (Core) y en la API .NET.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  username = '';
  password = '';
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    if (this.loading()) return;

    if (!this.username.trim() || !this.password) {
      this.errorMessage.set('Escribe tu usuario y contraseña.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      const session = await this.auth.login({
        username: this.username.trim(),
        password: this.password,
      });
      // No conservamos la contraseña en el estado del componente.
      this.password = '';
      await this.router.navigateByUrl(this.auth.routeForRole(session.role), {
        replaceUrl: true,
      });
    } catch (error) {
      this.password = '';
      this.errorMessage.set(error instanceof AuthFlowError
        ? error.message
        : 'Ocurrió un problema al iniciar sesión.');
    } finally {
      this.loading.set(false);
    }
  }
}
