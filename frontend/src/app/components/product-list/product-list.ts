import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: string[] = ['Electronics', 'Clothing'];
  selectedCategory: string | null = null;
  isLoading: boolean = false;

  private allProducts: Product[] = [
    {
      id: 1,
      title: 'Laptop Gamer',
      price: 1200,
      category: 'Electronics',
      description: 'Laptop de alto rendimiento',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23333" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>'
    },
    {
      id: 2,
      title: 'Camiseta Deportiva',
      price: 30,
      category: 'Clothing',
      description: '100% Algodón',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23333" stroke-width="2"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>'
    },
    {
      id: 3,
      title: 'Audífonos Bluetooth',
      price: 80,
      category: 'Electronics',
      description: 'Cancelación de ruido',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23333" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>'
    },
    {
      id: 4,
      title: 'Pantalón Jean',
      price: 45,
      category: 'Clothing',
      description: 'Corte clásico',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23333" stroke-width="2"><path d="M6 2h12l1 20h-5l-2-10-2 10H5L6 2z"/></svg>'
    }
  ];
  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = false;
    this.products = this.allProducts;
  }

  selectCategory(category: string | null): void {
    this.selectedCategory = category;
    if (!category) {
      this.products = this.allProducts;
    } else {
      this.products = this.allProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
  }
}
