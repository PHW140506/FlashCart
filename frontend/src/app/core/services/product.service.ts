import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly productsUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.products}`;

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.productsUrl}/categories`);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.productsUrl}/category/${encodeURIComponent(category)}`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.productsUrl}/${id}`);
  }
}