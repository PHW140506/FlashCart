import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { CatalogComponent } from './features/catalog/catalog.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    component: CatalogComponent,
    title: 'FlashCart - Catálogo de Productos'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];