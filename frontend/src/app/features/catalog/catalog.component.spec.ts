import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CatalogComponent } from './catalog.component';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

describe('CatalogComponent', () => {
  let component: CatalogComponent;
  let fixture: ComponentFixture<CatalogComponent>;
  let productServiceMock: { getProducts: ReturnType<typeof vi.fn> };

  const mockProducts: Product[] = [
    {
      id: 1,
      title: 'Backpack 15 inch',
      price: 109.95,
      description: 'Durable backpack',
      category: 'bags',
      image: 'https://example.com/bag.jpg',
      rating: { rate: 4.5, count: 100 }
    },
    {
      id: 2,
      title: 'Casual T-Shirt',
      price: 22.5,
      description: 'Cotton shirt',
      category: 'clothing',
      image: 'https://example.com/shirt.jpg',
      rating: { rate: 4.0, count: 50 }
    }
  ];

  beforeEach(async () => {
    productServiceMock = {
      getProducts: vi.fn().mockReturnValue(of(mockProducts))
    };

    await TestBed.configureTestingModule({
      imports: [CatalogComponent],
      providers: [
        { provide: ProductService, useValue: productServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load and display products on initialization', () => {
    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
    expect(component.products().length).toBe(2);

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.product-card');
    expect(cards.length).toBe(2);

    const firstTitle = compiled.querySelector('.product-title')?.textContent;
    expect(firstTitle).toContain('Backpack 15 inch');

    const firstPrice = compiled.querySelector('.product-price')?.textContent;
    expect(firstPrice).toContain('$109.95');

    const firstImage = compiled.querySelector('.product-image') as HTMLImageElement;
    expect(firstImage.getAttribute('loading')).toBe('lazy');
    expect(firstImage.src).toContain('https://example.com/bag.jpg');
  });

  it('should show error state and retry button when request fails', () => {
    productServiceMock.getProducts.mockReturnValue(throwError(() => new Error('Network error')));

    component.loadProducts();
    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.error()).toBe('No pudimos cargar los productos. Verifica tu conexión e intenta nuevamente.');

    const compiled = fixture.nativeElement as HTMLElement;
    const errorAlert = compiled.querySelector('.error-container');
    expect(errorAlert).toBeTruthy();

    const retryBtn = compiled.querySelector('.retry-button') as HTMLButtonElement;
    expect(retryBtn).toBeTruthy();
    expect(retryBtn.textContent).toContain('Reintentar');
  });

  it('should re-execute getProducts when clicking retry button', () => {
    productServiceMock.getProducts.mockReturnValue(throwError(() => new Error('Network error')));
    component.loadProducts();
    fixture.detectChanges();

    // Now restore mock to return products on retry
    productServiceMock.getProducts.mockReturnValue(of(mockProducts));

    const compiled = fixture.nativeElement as HTMLElement;
    const retryBtn = compiled.querySelector('.retry-button') as HTMLButtonElement;
    retryBtn.click();
    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
    expect(component.products().length).toBe(2);
  });
});
