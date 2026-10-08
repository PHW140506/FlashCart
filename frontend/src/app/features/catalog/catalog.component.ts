import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<Product[]>([]);
  readonly categories = signal<string[]>([]);
  readonly selectedCategory = signal<string | null>(null);
  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCategories();
    this.fetchProducts();
  }

  loadCategories(): void {
    this.productService.getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.categories.set(data),
        error: (err) => console.error('Error al cargar categorías:', err)
      });
  }

  selectCategory(category: string | null): void {
    if (this.selectedCategory() === category) return;
    this.selectedCategory.set(category);
    this.fetchProducts();
  }

  fetchProducts(): void {
    // Gestión de memoria preventiva exigida en la US04:
    this.products.set([]);
    this.loading.set(true);
    this.errorMessage.set(null);

    const activeCat = this.selectedCategory();
    const request$ = activeCat 
      ? this.productService.getProductsByCategory(activeCat)
      : this.productService.getProducts();

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.products.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error al cargar productos:', err);
          this.errorMessage.set('No se pudieron obtener los productos para esta selección.');
          this.loading.set(false);
        }
      });
  }
}