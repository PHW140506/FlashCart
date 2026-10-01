import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (module) => module.LoginComponent,
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Administrador'] },
    loadComponent: () =>
      import('./features/home/admin-home.component').then(
        (module) => module.AdminHomeComponent,
      ),
  },
  {
    path: 'auditor',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Auditor'] },
    loadComponent: () =>
      import('./features/home/auditor-home.component').then(
        (module) => module.AuditorHomeComponent,
      ),
  },
  {
    path: 'catalogo',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Cliente'] },
    loadComponent: () =>
      import('./features/home/client-home.component').then(
        (module) => module.ClientHomeComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
