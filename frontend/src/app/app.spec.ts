import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserSession } from './core/models/auth.models';
import { AuthService } from './core/services/auth.service';
import { App } from './app';

// US02: usamos un servicio simulado para probar solamente la interfaz global.
// No se realizan peticiones HTTP ni se guardan tokens reales durante estas pruebas.
describe('App - barra global de cierre de sesion (US02)', () => {
  const session = signal<UserSession | null>(null);
  const logout = vi.fn<() => Promise<void>>();

  const userSession: UserSession = {
    token: 'token-solo-para-pruebas',
    role: 'Auditor',
    user: {
      id: 3,
      fullName: 'Usuario Auditor',
      username: 'auditor',
      email: 'auditor@example.test',
      phone: '0000000000',
      role: 'Auditor',
      address: { city: 'Prueba', street: 'Ejemplo', number: 1, zipcode: '00000' },
    },
  };

  beforeEach(async () => {
    session.set(null);
    logout.mockReset();
    logout.mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        // App depende de AuthService, pero aquí se comprueba su vista y sus avisos.
        { provide: AuthService, useValue: { currentSession: session.asReadonly(), logout } },
      ],
    }).compileComponents();
  });

  it('crea el componente sin iniciar sesion', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.logout-button')).toBeNull();
  });

  it('muestra el boton global y los datos del perfil activo', () => {
    session.set(userSession);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const html = fixture.nativeElement as HTMLElement;

    expect(html.querySelector('.brand-name')?.textContent).toContain('FlashCart');
    expect(html.querySelector('.session-profile')?.textContent).toContain('Usuario Auditor');
    expect(html.querySelector('.session-profile')?.textContent).toContain('Auditor');
    expect(html.querySelectorAll('.logout-button')).toHaveLength(1);
  });

  it('permite cerrar sesion usando AuthService, sin duplicar la logica', async () => {
    session.set(userSession);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.logout-button') as HTMLButtonElement;

    button.click();
    await fixture.whenStable();

    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('avisa al usuario cuando falla el borrado de credenciales', async () => {
    session.set(userSession);
    logout.mockRejectedValueOnce(new Error('No se pudo eliminar la sesion'));
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.logout-button') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent)
      .toContain('Intenta cerrar sesión nuevamente');
  });
});
