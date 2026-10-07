import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="catalog-view">
      <header>
        <h1>Catálogo General de Productos</h1>
        <p>Explora nuestra selección completa de artículos disponibles</p>
      </header>

      @if (loading()) {
        <p>Cargando catálogo...</p>
      } @else if (error()) {
        <p class="error">{{ error() }}</p>
      } @else {
        <div class="products-grid">
          @for (product of products(); track product.id) {
            <article class="product-card">
              <h3>{{ product.title }}</h3>
              <p>\${{ product.price }}</p>
            </article>
          }
        </div>
      }
    </section>
  `
})
export class CatalogComponent implements OnInit {
  private readonly productService = inject(ProductService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No fue posible cargar los productos.');
        this.loading.set(false);
      }
    });
  }
}