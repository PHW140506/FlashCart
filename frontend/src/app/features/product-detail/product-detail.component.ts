import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly product = signal<Product | null>(null);
  readonly loading = signal<boolean>(true);
  readonly notFoundMessage = signal<string | null>(null);

  // Lectura estricta de la sesión local mediante el Signal del AuthService
  readonly isAdmin = computed(() => this.authService.currentRole() === 'Administrador');

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const productId = Number(idParam);

    if (!idParam || isNaN(productId)) {
      this.handleProductNotFound();
      return;
    }

    this.fetchProduct(productId);
  }

  fetchProduct(id: number): void {
    this.loading.set(true);
    this.notFoundMessage.set(null);

    this.productService.getProductById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.product.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.warn('Producto no disponible o error de consulta:', err);
          this.handleProductNotFound();
        }
      });
  }

  handleProductNotFound(): void {
    this.loading.set(false);
    this.product.set(null);
    this.notFoundMessage.set('Producto no disponible. Redirigiendo al catálogo...');

    setTimeout(() => {
      this.router.navigate(['/catalogo']);
    }, 2500);
  }

  onEdit(): void {
    alert(`Modo de gestión: Editando producto #${this.product()?.id}`);
  }

  onDelete(): void {
    if (confirm(`¿Confirmas eliminar el producto "${this.product()?.title}"?`)) {
      alert(`Producto #${this.product()?.id} marcado para eliminación`);
    }
  }
}