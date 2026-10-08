import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Si ya inició sesión, no volvemos a mostrar el formulario de acceso.
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const session = await auth.restoreSession();
  return session ? router.parseUrl(auth.routeForRole(session.role)) : true;
};
