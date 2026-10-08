import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly usersUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users}`;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl);
  }
}