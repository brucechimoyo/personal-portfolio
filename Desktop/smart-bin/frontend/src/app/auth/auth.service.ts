import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from '../core/services/api.service';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    username: string;
    role: string;
  };
}

export interface User {
  username: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authState = new BehaviorSubject<boolean>(false);
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor(private apiService: ApiService) {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser.next(JSON.parse(savedUser));
      this.authState.next(true);
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', { username, password }).pipe(
      tap(response => {
        if (response.success) {
          this.authState.next(true);
          if (response.user) {
            this.currentUser.next(response.user);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
          }
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.apiService.post<any>('/auth/logout', {}).pipe(
      tap(() => {
        this.authState.next(false);
        this.currentUser.next(null);
        localStorage.removeItem('currentUser');
      })
    );
  }

  register(username: string, password: string, email: string): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/register', { username, password, email });
  }

  isAuthenticated(): Observable<boolean> {
    return this.authState.asObservable();
  }

  isAuthenticatedSync(): boolean {
    return this.authState.value;
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  getCurrentUserSync(): User | null {
    return this.currentUser.value;
  }
} 