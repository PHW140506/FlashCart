import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-catalog',
  imports: [DecimalPipe],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<Product[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly skeletonCount = Array.from({ length: 8 });

  private readonly fallbackImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="%23f1f5f9"><rect width="200" height="200" fill="%23f1f5f9"/><path d="M70 120 L95 90 L115 110 L130 95 L150 120 Z" fill="%23cbd5e1"/><circle cx="85" cy="75" r="10" fill="%23cbd5e1"/><text x="50%" y="150" font-family="sans-serif" font-size="12" fill="%2394a3b8" text-anchor="middle">Imagen no disponible</text></svg>';

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.products.set(data);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          console.error('Error fetching products catalog:', err);
          this.loading.set(false);
          this.error.set('No pudimos cargar los productos. Verifica tu conexión e intenta nuevamente.');
        }
      });
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && target.src !== this.fallbackImage) {
      target.src = this.fallbackImage;
    }
  }
}
