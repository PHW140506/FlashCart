import { Routes } from '@angular/router';
import { CatalogComponent } from './features/catalog/catalog.component';

export const routes: Routes = [
  {
    path: '',
    component: CatalogComponent,
    title: 'FlashCart - Catálogo de Productos'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
