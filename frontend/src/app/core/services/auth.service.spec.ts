import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LoginResponse } from '../models/auth.models';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { ConnectivityService } from './connectivity.service';
import { SecureSessionStorageService } from './secure-session-storage.service';

// US02: verificamos que al salir se limpian el almacenamiento, el usuario y el carrito.
// Los dobles (mocks) nos permiten simular un error de almacenamiento sin afectar datos reales.
describe('AuthService - cierre de sesion (US02)', () => {
  const user: LoginResponse['user'] = {
    id: 1,
    fullName: 'Usuario Administrador',
    username: 'johndoe',
    email: 'admin@example.test',
    phone: '0000000000',
    role: 'Administrador',
    address: { city: 'Prueba', street: 'Ejemplo', number: 1, zipcode: '00000' },
  };

  let auth: AuthService;
  let router: Router;
  let storage: { save: ReturnType<typeof vi.fn>; read: ReturnType<typeof vi.fn>; clear: ReturnType<typeof vi.fn> };
  let cart: { clearCart: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    const response: LoginResponse = { token: `header.${payload}.firma`, user };
    storage = {
      save: vi.fn().mockResolvedValue(undefined),
      read: vi.fn().mockResolvedValue(null),
      clear: vi.fn().mockResolvedValue(undefined),
    };
    cart = { clearCart: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        AuthService,
        { provide: HttpClient, useValue: { post: vi.fn().mockReturnValue(of(response)) } },
        { provide: ConnectivityService, useValue: { isConnected: vi.fn().mockResolvedValue(true) } },
        { provide: SecureSessionStorageService, useValue: storage },
        { provide: CartService, useValue: cart },
      ],
    });

    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  async function logIn(): Promise<void> {
    await auth.login({ username: 'johndoe', password: 'solo-para-pruebas' });
  }

  it('elimina sesion, token y carrito y navega al login', async () => {
    await logIn();
    expect(auth.isAuthenticated()).toBe(true);

    await auth.logout();

    expect(storage.clear).toHaveBeenCalledTimes(1);
    expect(auth.currentSession()).toBeNull();
    expect(auth.currentRole()).toBeNull();
    expect(cart.clearCart).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('no presenta un logout exitoso si falla la eliminacion persistente', async () => {
    await logIn();
    storage.clear.mockRejectedValueOnce(new Error('Fallo de almacenamiento'));

    await expect(auth.logout()).rejects.toThrow('Fallo de almacenamiento');

    // Permanece la sesion para que la interfaz permita reintentar el borrado.
    expect(auth.isAuthenticated()).toBe(true);
    expect(cart.clearCart).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
