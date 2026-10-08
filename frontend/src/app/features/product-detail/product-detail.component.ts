import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService } from '../../core/services/product.service';
import { ProductWriteService } from '../../core/services/product-write.service';
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
  private readonly productWriter = inject(ProductWriteService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly product = signal<Product | null>(null);
  readonly loading = signal<boolean>(true);
  readonly notFoundMessage = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly deletedMessage = signal<string | null>(null);
  readonly deleting = signal(false);
  readonly updated = signal(false);
  readonly isAdmin = computed(() => this.authService.currentRole() === 'Administrador');

  ngOnInit(): void {
    this.updated.set(this.route.snapshot.queryParamMap.get('actualizado') === '1');
    const idParam = this.route.snapshot.paramMap.get('id');
    const productId = Number(idParam);
    if (!idParam || !Number.isSafeInteger(productId) || productId <= 0) {
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
        next: data => {
          this.product.set(data);
          this.loading.set(false);
        },
        error: error => {
          console.warn('Producto no disponible o error de consulta:', error);
          this.handleProductNotFound();
        },
      });
  }

  handleProductNotFound(): void {
    this.loading.set(false);
    this.product.set(null);
    this.notFoundMessage.set('Producto no disponible. Redirigiendo al catálogo...');
    const timer = setTimeout(() => void this.router.navigate(['/catalogo']), 2500);
    this.destroyRef.onDestroy(() => clearTimeout(timer));
  }

  onEdit(): void {
    const id = this.product()?.id;
    if (!this.isAdmin() || !id) return;
    void this.router.navigate(['/productos', id, 'editar']);
  }

  onDelete(): void {
    const item = this.product();
    if (!this.isAdmin() || !item || this.deleting()) return;
    if (!confirm(`¿Confirmas eliminar el producto "${item.title}"?`)) return;

    this.actionError.set(null);
    this.deleting.set(true);
    this.productWriter.delete(item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deleting.set(false);
          this.product.set(null);
          this.deletedMessage.set(`Producto #${item.id} eliminado correctamente.`);
          const timer = setTimeout(() => void this.router.navigate(['/catalogo']), 1500);
          this.destroyRef.onDestroy(() => clearTimeout(timer));
        },
        error: error => {
          this.deleting.set(false);
          if (error instanceof HttpErrorResponse) {
            if (error.status === 0) this.actionError.set('No hay conexión con la API local.');
            else if (error.status === 401) this.actionError.set('Tu sesión expiró. Inicia sesión nuevamente.');
            else if (error.status === 403) this.actionError.set('No tienes permiso para eliminar productos.');
            else if (error.status === 404) this.actionError.set('El producto ya había sido eliminado.');
            else this.actionError.set('No se pudo eliminar el producto. Intenta nuevamente.');
          } else {
            this.actionError.set('No se pudo eliminar el producto.');
          }
        },
      });
  }
}
