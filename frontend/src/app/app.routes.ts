import { Routes } from '@angular/router';
import { CatalogComponent } from './features/catalog/catalog.component';

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
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'catalogo',
    component: CatalogComponent,
    title: 'FlashCart - Catálogo de Productos',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/home/admin-home.component').then(
        (m) => m.AdminHomeComponent
      ),
  },
  {
    path: 'auditor',
    loadComponent: () =>
      import('./features/home/auditor-home.component').then(
        (m) => m.AuditorHomeComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];