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

  // Se reutiliza la misma dirección base del backend local
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
      // Almacenamiento seguro de sesión
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
      // Al reabrir