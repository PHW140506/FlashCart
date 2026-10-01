export type UserRole = 'Administrador' | 'Auditor' | 'Cliente';

export interface UserSession {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  token: string;
}