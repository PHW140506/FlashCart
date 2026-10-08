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
import { CartService } from './cart.service';

/**
 * Core: servicio global (singleton) encargado de la sesión.
 * Angular NO comprueba contraseñas: solo las envía al backend .NET.
 * API Controller -> MediatR -> Handler -> repositorio: allí vive la lógica del negocio.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly connectivity = inject(ConnectivityService);
  private readonly storage = inject(SecureSessionStorageService);
  private readonly cartService = inject(CartService);

  // Se reutiliza la misma dirección que ya usa el catálogo y los usuarios.
  private readonly loginUrl = `${API_CONFIG.baseUrl}/auth/login`;
  private readonly validateUrl = `${API_CONFIG.baseUrl}/auth/validate`;

  private readonly sessionSignal = signal<UserSession | null>(null);
  private sessionWasRestored = false;

  readonly currentSession = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);
  readonly currentRole = computed(() => this.sessionSignal()?.role ?? null);

  async login(credentials: LoginCredentials): Promise<UserSession> {
    // Criterio US01: avisar sobre falta de conexión ANTES de llamar a la API.
    if (!(await this.connectivity.isConnected())) {
      throw new AuthFlowError('NO_CONNECTION', 'No tienes conexión de red.');
    }

    let response: LoginResponse;
    try {
      // La respuesta la genera nuestro backend local; NO utilizamos proveedores HTTP externos.
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

    // No confiamos en una respuesta vacía o con un usuario incompleto.
    if (!response?.token || !response.user || !Number.isInteger(response.user.id) || response.user.id <= 0) {
      throw new AuthFlowError('INVALID_TOKEN', 'El servidor devolvió una sesión inválida.');
    }
    if (this.tokenExpired(response.token)) {
      throw new AuthFlowError('INVALID_TOKEN', 'El servidor devolvió un token vencido o inválido.');
    }

    // Regla de US01: los IDs 1 y 2 son Admin, el 3 Auditor y los demás Cliente.
    const expectedRole = this.mapRole(response.user.id);
    if (response.user.role !== expectedRole) {
      throw new AuthFlowError('INVALID_TOKEN', 'El perfil devuelto por la API no coincide con el usuario.');
    }

    const session: UserSession = {
      token: response.token,
      role: expectedRole,
      user: response.user,
    };

    try {
      // El servicio existente utiliza almacenamiento seguro de Capacitor en móvil.
      await this.storage.save(session);
    } catch {
      throw new AuthFlowError('STORAGE_ERROR', 'No fue posible guardar la sesión en este dispositivo.');
    }

    this.sessionSignal.set(session);
    this.sessionWasRestored = true;
    return session;
  }

  async restoreSession(): Promise<UserSession | null> {
    // Las vistas y Guards comparten esta misma instancia del servicio.
    const inMemory = this.sessionSignal();
    if (this.sessionWasRestored) {
      if (inMemory && !this.tokenExpired(inMemory.token)) {
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

    if (!saved) {
      this.sessionSignal.set(null);
      this.sessionWasRestored = true;
      return null;
    }

    // Comprobación local de forma/expiración: NO sustituye la firma del JWT.
    if (!this.validSavedSession(saved) || this.tokenExpired(saved.token)) {
      await this.discardSession();
      return null;
    }

    try {
      // Al reabrir la aplicación, .NET valida firma y vigencia del token.
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
        await this.discardSession(); // El servidor ya no acepta este token.
      }
      // Si la API está apagada no borramos la sesión guardada: podremos reintentar.
      return null;
    }
  }

  /**
   * US02 reutiliza este método: borra almacenamiento, sesión y carrito.
   * replaceUrl evita dejar la pantalla anterior como destino inmediato del navegador.
   * La protección real de rutas también depende de los Guards y del backend.
   */
  async logout(): Promise<void> {
    await this.storage.clear();
    this.sessionSignal.set(null);
    this.sessionWasRestored = true;
    this.cartService.clearCart();
    await this.router.navigate(['/login'], { replaceUrl: true });
  }

  routeForRole(role: UserRole): string {
    switch (role) {
      case 'Administrador': return '/admin';
      case 'Auditor': return '/auditor';
      default: return '/catalogo';
    }
  }

  private mapRole(id: number): UserRole {
    if (id === 1 || id === 2) return 'Administrador';
    if (id === 3) return 'Auditor';
    return 'Cliente';
  }

  private validSavedSession(session: UserSession): boolean {
    return Boolean(
      session &&
      typeof session.token === 'string' &&
      session.user &&
      Number.isInteger(session.user.id) &&
      session.user.id > 0 &&
      session.role === this.mapRole(session.user.id) &&
      session.user.role === session.role,
    );
  }

  private tokenExpired(token: string): boolean {
    try {
      const pieces = token.split('.');
      if (pieces.length !== 3) return true;
      const payloadPart = pieces[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = payloadPart.padEnd(Math.ceil(payloadPart.length / 4) * 4, '=');
      const payload = JSON.parse(atob(padded)) as { exp?: unknown };
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
      // La sesión queda invalidada en memoria incluso si falla el almacenamiento.
    }
  }
}
