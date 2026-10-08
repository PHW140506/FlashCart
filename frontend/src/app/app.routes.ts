import { Routes } from '@angular/router';
import { CatalogComponent } from './features/catalog/catalog.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';

// Core/Guards protege la navegación. .NET debe proteger además sus endpoints.
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'FlashCart - Iniciar sesión',
  },
  {
    path: 'catalogo',
    component: CatalogComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Cliente', 'Administrador', 'Auditor'] },
    title: 'FlashCart - Catálogo de Productos',
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Administrador'] },
    title: 'FlashCart - Control de Usuarios',
  },
  {
    path: 'carritos',
    loadComponent: () => import('./features/carts/carts.component').then(m => m.CartsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Administrador', 'Auditor'] },
    title: 'FlashCart - Histórico de Carritos',
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/home/admin-home.component').then(m => m.AdminHomeComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Administrador'] },
    title: 'FlashCart - Administrador',
  },
  {
    path: 'auditor',
    loadComponent: () => import('./features/home/auditor-home.component').then(m => m.AuditorHomeComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Auditor'] },
    title: 'FlashCart - Auditor',
  },
  { path: '**', redirectTo: 'login' },
];
