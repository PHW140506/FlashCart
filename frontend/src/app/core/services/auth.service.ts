import { API_CONFIG } from '../config/api.config';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  AuthFlowError,
  FakeStoreUser,
  LoginCredentials,
  LoginResponse,
  UserRole,
  UserSession,
} from '../models/auth.models';
import { ConnectivityService } from './connectivity.service';
import { SecureSessionStorageService } from './secure-session-storage.service';
import { CartService } from './cart.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly connectivity = inject(ConnectivityService);
  private readonly storage = inject(SecureSessionStorageService);
  private readonly cartService = inject(CartService);

  private readonly apiUrl = API_CONFIG.baseUrl;

  private readonly sessionSignal = signal<UserSession | null>(null);
  private sessionWasRestored = false;

  readonly currentSession = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);
  readonly currentRole = computed(() => this.sessionSignal()?.role ?? null);

  async login(credentials: LoginCredentials): Promise<UserSession> {
    const connected = await this.connectivity.isConnected();

    if (!connected) {
      throw new AuthFlowError(
        'NO_CONNECTION',
        'Sin conexión a internet.',
      );
    }

    let response: LoginResponse;

    try {
      response = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials),
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 0) {
          throw new AuthFlowError(
            'NO_CONNECTION',
            'No fue posible establecer conexión con el servicio.',
          );
        }

        if (error.status === 400 || error.status === 401) {
          throw new AuthFlowError(
            'INVALID_CREDENTIALS',
            'Usuario o contraseña inválidos',
          );
        }
      }

      throw new AuthFlowError(
        'UNKNOWN',
        'Ocurrió un error al iniciar sesión.',
      );
    }

    if (!response?.token) {
      throw new AuthFlowError(
        'INVALID_TOKEN',
        'La API no devolvió un token válido.',
      );
    }

    const userId = this.getUserIdFromToken(response.token);

    let user: FakeStoreUser;

    try {
      user = await firstValueFrom(
        this.http.get<FakeStoreUser>(`${this.apiUrl}${API_CONFIG.endpoints.users}/${userId}`),
      );
    } catch {
      throw new AuthFlowError(
        'USER_INFO_ERROR',
        'No fue posible descargar la información del usuario.',
      );
    }

    const session: UserSession = {
      token: response.token,
      role: this.mapRole(user.id),
      user,
    };

    await this.storage.save(session);
    this.sessionSignal.set(session);
    this.sessionWasRestored = true;

    return session;
  }

  async restoreSession(): Promise<UserSession | null> {
    if (this.sessionWasRestored) {
      return this.sessionSignal();
    }

    try {
      const storedSession = await this.storage.read();
      this.sessionSignal.set(storedSession);
      return storedSession;
    } catch {
      this.sessionSignal.set(null);
      return null;
    } finally {
      this.sessionWasRestored = true;
    }
  }

  async logout(): Promise<void> {
    await this.storage.clear();
    this.sessionSignal.set(null);
    this.sessionWasRestored = true;
    this.cartService.clearCart();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  routeForRole(role: UserRole): string {
    switch (role) {
      case 'Administrador':
        return '/admin';
      case 'Auditor':
        return '/auditor';
      default:
        return '/catalogo';
    }
  }

  private mapRole(userId: number): UserRole {
    if (userId === 1 || userId === 2) {
      return 'Administrador';
    }

    if (userId === 3) {
      return 'Auditor';
    }

    return 'Cliente';
  }

  private getUserIdFromToken(token: string): number {
    try {
      const tokenParts = token.split('.');

      if (tokenParts.length < 2) {
        throw new Error('Token incompleto');
      }

      const base64Url = tokenParts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const payload = JSON.parse(atob(padded)) as { sub?: string | number };

      const userId = Number(payload.sub);

      if (!Number.isInteger(userId) || userId <= 0) {
        throw new Error('ID inválido');
      }

      return userId;
    } catch {
      throw new AuthFlowError(
        'INVALID_TOKEN',
        'No fue posible identificar al usuario desde el token.',
      );
    }
  }
}