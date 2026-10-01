import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models/auth.models';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = async (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const session = await authService.restoreSession();

  if (!session) {
    return router.parseUrl('/login');
  }

  const allowedRoles = (route.data['roles'] ?? []) as UserRole[];

  if (allowedRoles.includes(session.role)) {
    return true;
  }

  return router.parseUrl(authService.routeForRole(session.role));
};
