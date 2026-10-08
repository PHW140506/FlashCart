import type { User } from './user.model';

// Modelo compartido entre Core (servicios/guards) y Features (pantallas).
// User coincide con el UserDto que devuelve nuestro backend .NET.
export type UserRole = User['role'];

export interface LoginCredentials {
  username: string;
  password: string;
}

// POST /api/auth/login devuelve un token y la información del usuario.
export interface LoginResponse {
  token: string;
  user: User;
}

export interface UserSession {
  token: string;
  role: UserRole;
  user: User;
}

export type AuthErrorCode =
  | 'NO_CONNECTION'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_TOKEN'
  | 'STORAGE_ERROR'
  | 'UNKNOWN';

export class AuthFlowError extends Error {
  constructor(public readonly code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'AuthFlowError';
  }
}
