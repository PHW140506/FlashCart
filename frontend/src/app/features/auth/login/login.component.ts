import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthFlowError } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.formBuilder.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  async submit(): Promise<void> {
    this.errorMessage.set('');

    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    try {
      const session = await this.authService.login(this.form.getRawValue());
      await this.router.navigateByUrl(
        this.authService.routeForRole(session.role),
        { replaceUrl: true },
      );
    } catch (error) {
      if (error instanceof AuthFlowError) {
        switch (error.code) {
          case 'INVALID_CREDENTIALS':
            this.errorMessage.set('Usuario o contraseña inválidos');
            break;
          case 'NO_CONNECTION':
            this.errorMessage.set(
              'Sin conexión a internet. Verifica tu red e inténtalo de nuevo.',
            );
            break;
          case 'USER_INFO_ERROR':
            this.errorMessage.set(
              'Se inició sesión, pero no fue posible descargar tu información.',
            );
            break;
          default:
            this.errorMessage.set('No fue posible iniciar sesión.');
        }
      } else {
        this.errorMessage.set('No fue posible iniciar sesión.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
