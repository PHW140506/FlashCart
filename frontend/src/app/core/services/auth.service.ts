import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import {
  AuthFlowError,
  LoginCredentials,
  LoginResponse,
  UserRole,
  UserSession,
} from '../models/auth.models';
import { ConnectivityService } from './connectivity.service';
import { SecureSessionStorageService } from './secure-session-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly connectivity = inject(ConnectivityService);
  private readonly storage = inject(SecureSessionStorageService);

  private readonly loginUrl = `${API_CONFIG.baseUrl}/auth/login`;
  private readonly validateUrl = `${API_CONFIG.baseUrl}/auth/validate`;

  private readonly sessionSignal = signal<UserSession | null>(null);
  private sessionWasRestored = false;

  readonly currentSession = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);
  readonly currentRole = computed(() => this.sessionSignal()?.role ?? null);

  async login(credentials: LoginCredentials): Promise<UserSession> {
    if (!(await this.connectivity.isConnected())) {
      throw new AuthFlowError('NO_CONNECTION', 'No tienes conexión de red.');
    }

    let response: LoginResponse;
    try {
      response = await firstValueFrom(
        this.http.post<LoginResponse>(this.loginUrl, credentials),
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 0) {
          throw new AuthFlowError('NO_CONNECTION', 'No fue posible conectarse con el servidor local.');
        }
        if (error.status === 400 || error.status === 401) {
          throw new AuthFlowError('INVALID_CREDENTIALS', 'Usuario o contraseña inválidos');
        }
      }
      throw new AuthFlowError('UNKNOWN', 'No se pudo iniciar sesión. Intenta nuevamente.');
    }

    if (!response?.token || !response.user || !Number.isInteger(response.user.id) || response.user.id <= 0) {
      throw new AuthFlowError('INVALID_TOKEN', 'El servidor devolvió una sesión inválida.');
    }

    if (this.isTokenExpired(response.token)) {
      throw new AuthFlowError('INVALID_TOKEN', 'El servidor devolvió un token vencido o inválido.');
    }

    // El rol viene legitimado directamente por la API del backend, sin hardcodear IDs
    const session: UserSession = {
      token: response.token,
      role: response.user.role,
      user: response.user,
    };

    try {
      await this.storage.save(session);
    } catch {
      throw new AuthFlowError('STORAGE_ERROR', 'No fue posible guardar la sesión en este dispositivo.');
    }

    this.sessionSignal.set(session);
    this.sessionWasRestored = true;
    return session;
  }

  async restoreSession(): Promise<UserSession | null> {
    const inMemory = this.sessionSignal();
    if (this.sessionWasRestored) {
      if (inMemory && !this.isTokenExpired(inMemory.token)) {
        return inMemory;
      }
      if (inMemory) {
        await this.discardSession();
      }
      return null;
    }

    let saved: UserSession | null;
    try {
      saved = await this.storage.read();
    } catch {
      this.sessionSignal.set(null);
      return null;
    }

    if (!saved || !this.isValidSession(saved) || this.isTokenExpired(saved.token)) {
      await this.discardSession();
      return null;
    }

    try {
      await firstValueFrom(
        this.http.get<void>(this.validateUrl, {
          headers: new HttpHeaders({ Authorization: `Bearer ${saved.token}` }),
        }),
      );
      this.sessionSignal.set(saved);
      this.sessionWasRestored = true;
      return saved;
    } catch (error) {
      this.sessionSignal.set(null);
      if (error instanceof HttpErrorResponse && error.status === 401) {
        await this.discardSession();
      }
      return null;
    }
  }

  // Desacoplado: ya no manipula el CartService directamente (Principio de Inversión de Dependencias)
  async logout(): Promise<void> {
    await this.discardSession();
    await this.router.navigate(['/login'], { replaceUrl: true });
  }

  routeForRole(role: UserRole): string {
    switch (role) {
      case 'Administrador': return '/admin';
      case 'Auditor': return '/auditor';
      default: return '/catalogo';
    }
  }

  private isValidSession(session: UserSession): boolean {
    return Boolean(
      session &&
      typeof session.token === 'string' &&
      session.user &&
      Number.isInteger(session.user.id) &&
      session.user.id > 0 &&
      session.role === session.user.role,
    );
  }

  private isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000);
    } catch {
      return true;
    }
  }

  private async discardSession(): Promise<void> {
    this.sessionSignal.set(null);
    this.sessionWasRestored = true;
    try {
      await this.storage.clear();
    } catch {
      // Ignorar fallo de almacenamiento si la sesión en memoria ya se limpió
    }
  }
}
