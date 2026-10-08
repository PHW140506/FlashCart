import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from './auth.service';
import { ProductWriteService } from './product-write.service';
import { API_CONFIG } from '../config/api.config';
import { ProductWriteInput } from '../models/product-write.model';

const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.products}`;
const input: ProductWriteInput = {
  title: 'Mouse', price: 125.50, description: 'Mouse inalámbrico',
  category: 'electronics', image: 'https://example.com/mouse.png',
};

describe('ProductWriteService (Épica 3)', () => {
  let service: ProductWriteService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { currentSession: signal({ token: 'jwt-prueba' }) } },
      ],
    });
    service = TestBed.inject(ProductWriteService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('US06 envía POST a la API local con JWT y devuelve el ID', () => {
    service.create(input).subscribe(product => expect(product.id).toBe(5));
    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(input);
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-prueba');
    request.flush({ id: 5, ...input });
  });

  it('US07 envía PUT con el ID en la ruta', () => {
    service.update(5, input).subscribe(product => expect(product.title).toBe('Mouse'));
    const request = http.expectOne(`${url}/5`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(input);
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-prueba');
    request.flush({ id: 5, ...input });
  });

  it('US08 envía DELETE autenticado, sin cuerpo', () => {
    service.delete(5).subscribe(result => expect(result).toBeNull());
    const request = http.expectOne(`${url}/5`);
    expect(request.request.method).toBe('DELETE');
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-prueba');
    request.flush(null, { status: 204, statusText: 'No Content' });
  });
});
