export type UserRole = 'Administrador' | 'Auditor' | 'Cliente';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface FakeStoreUser {
  id: number;
  email: string;
  username: string;
  name: {
    firstname: string;
    lastname: string;
  };
  phone: string;
}

export interface UserSession {
  token: string;
  role: UserRole;
  user: FakeStoreUser;
}

export type AuthErrorCode =
  | 'NO_CONNECTION'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_TOKEN'
  | 'USER_INFO_ERROR'
  | 'UNKNOWN';

export class AuthFlowError extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AuthFlowError';
  }
}
