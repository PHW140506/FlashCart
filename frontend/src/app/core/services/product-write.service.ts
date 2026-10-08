import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Product } from '../models/product.model';
import { ProductWriteInput } from '../models/product-write.model';
import { AuthService } from './auth.service';

/** US06–US08: centraliza las operaciones autenticadas de inventario. */
@Injectable({ providedIn: 'root' })
export class ProductWriteService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.products}`;

  create(input: ProductWriteInput): Observable<Product> {
    return this.http.post<Product>(this.url, input, { headers: this.authHeaders() });
  }

  update(id: number, input: ProductWriteInput): Observable<Product> {
    return this.http.put<Product>(`${this.url}/${id}`, input, { headers: this.authHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, { headers: this.authHeaders() });
  }

  private authHeaders(): HttpHeaders {
    const token = this.auth.currentSession()?.token;
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
