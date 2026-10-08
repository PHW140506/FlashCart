import { Routes } from '@angular/router';
import { CatalogComponent } from './features/catalog/catalog.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';

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
    path: 'catalogo/:id',
    loadComponent: () =>
      import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Cliente', 'Administrador', 'Auditor'] },
    title: 'FlashCart - Detalle de Producto',
  },
  // Épica 3: UI restringida a Administrador; .NET vuelve a validar el JWT/rol.
  {
    path: 'productos/nuevo',
    loadComponent: () =>
      import('./features/product-form/product-form.component').then(m => m.ProductFormComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Administrador'] },
    title: 'FlashCart - Registrar Producto',
  },
  {
    path: 'productos/:id/editar',
    loadComponent: () =>
      import('./features/product-form/product-form.component').then(m => m.ProductFormComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Administrador'] },
    title: 'FlashCart - Editar Producto',
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
