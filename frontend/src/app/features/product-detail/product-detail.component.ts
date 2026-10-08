import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, FormsModule],
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

  // Estados del modal de edición
  readonly isEditing = signal<boolean>(false);
  readonly saving = signal<boolean>(false);
  readonly updateError = signal<string | null>(null);

  // Formulario temporal
  editTitle = '';
  editPrice = 0;
  editCategory = '';
  editDescription = '';
  editImage = '';

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

  openEditModal(): void {
    const current = this.product();
    if (!current) return;

    this.editTitle = current.title;
    this.editPrice = current.price;
    this.editCategory = current.category;
    this.editDescription = current.description;
    this.editImage = current.image;
    this.updateError.set(null);
    this.isEditing.set(true);
  }

  closeEditModal(): void {
    if (this.saving()) return;
    this.isEditing.set(false);
    this.updateError.set(null);
  }

  saveProduct(): void {
    const current = this.product();
    if (!current || this.saving()) return;

    if (!this.editTitle.trim()) {
      this.updateError.set('El título no puede estar vacío.');
      return;
    }

    if (this.editPrice <= 0) {
      this.updateError.set('El precio debe ser mayor a 0.');
      return;
    }

    const payload: Product = {
      id: current.id,
      title: this.editTitle.trim(),
      price: Number(this.editPrice),
      description: this.editDescription.trim(),
      category: this.editCategory.trim(),
      image: this.editImage.trim() || current.image
    };

    this.saving.set(true);
    this.updateError.set(null);

    this.productService.updateProduct(current.id, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedProduct) => {
          this.product.set(updatedProduct);
          this.saving.set(false);
          this.isEditing.set(false);
        },
        error: (err) => {
          this.saving.set(false);
          this.updateError.set(err?.error?.message || 'Error al comunicarse con la API para actualizar el producto.');
        }
      });
  }

  onDelete(): void {
    if (confirm(`¿Confirmas eliminar el producto "${this.product()?.title}"?`)) {
      alert(`Producto #${this.product()?.id} marcado para eliminación`);
    }
  }
}