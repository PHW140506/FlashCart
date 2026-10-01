import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./features/products/home.component').then(m => m.HomeComponent)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];