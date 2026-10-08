import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService } from '../../core/services/product.service';
import { ProductWriteService } from '../../core/services/product-write.service';
import { ProductWriteInput } from '../../core/models/product-write.model';

/** US06 (alta) y US07 (edición) comparten un único formulario tipado. */
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly products = inject(ProductService);
  private readonly writer = inject(ProductWriteService);
  private readonly destroyRef = inject(DestroyRef);

  readonly productId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly createdId = signal<number | null>(null);

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    category: ['', [Validators.required, Validators.maxLength(100)]],
    image: ['', [Validators.required, Validators.maxLength(2048), Validators.pattern(/^https?:\/\/\S+$/i)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id === null) return;
    const productId = Number(id);
    if (!Number.isSafeInteger(productId) || productId <= 0) {
      this.errorMessage.set('El identificador del producto es inválido.');
      return;
    }

    this.productId.set(productId);
    this.loading.set(true);
    this.products.getProductById(productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: product => {
          this.form.setValue({
            title: product.title,
            price: product.price,
            description: product.description,
            category: product.category,
            image: product.image,
          });
          this.loading.set(false);
        },
        error: error => {
          this.errorMessage.set(this.errorFor(error));
          this.loading.set(false);
        },
      });
  }

  save(): void {
    if (this.saving() || this.loading()) return;
    this.errorMessage.set(null);
    this.createdId.set(null);
    this.form.markAllAsTouched();

    const value = this.form.getRawValue();
    const input: ProductWriteInput = {
      title: value.title.trim(),
      price: Number(value.price),
      description: value.description.trim(),
      category: value.category.trim(),
      image: value.image.trim(),
    };

    if (this.form.invalid || !input.title || !input.description || !input.category ||
        !Number.isFinite(input.price) || input.price <= 0 || !this.isValidImageUrl(input.image)) {
      this.errorMessage.set('Completa los campos requeridos, usa un precio positivo y una URL HTTP/HTTPS válida.');
      return; // No se envía ningún HTTP inválido.
    }

    if (this.route.snapshot.paramMap.has('id') && this.productId() === null) return;
    this.saving.set(true);
    const id = this.productId();
    const request$ = id === null ? this.writer.create(input) : this.writer.update(id, input);
    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: product => {
        this.saving.set(false);
        if (id === null) {
          this.form.reset({ title: '', price: 0, description: '', category: '', image: '' });
          this.createdId.set(product.id);
        } else {
          void this.router.navigate(['/catalogo', product.id], { queryParams: { actualizado: '1' } });
        }
      },
      error: error => {
        this.errorMessage.set(this.errorFor(error));
        this.saving.set(false);
      },
    });
  }

  private isValidImageUrl(raw: string): boolean {
    try {
      const url = new URL(raw);
      return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname);
    } catch {
      return false;
    }
  }

  private errorFor(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) return 'No fue posible guardar el producto.';
    if (error.status === 0) return 'Sin conexión con el backend local. Comprueba http://localhost:5178.';
    if (error.status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.';
    if (error.status === 403) return 'Este usuario no tiene permisos de Administrador.';
    if (error.status === 404) return 'El producto ya no existe.';
    if (error.status === 400) return error.error?.message ?? 'Los datos del producto no son válidos.';
    return 'El servidor no pudo completar la operación. Vuelve a intentarlo.';
  }
}
