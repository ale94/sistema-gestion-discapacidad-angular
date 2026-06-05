import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080';
  private readonly tokenStorageKey = 'auth_token';
  private readonly usernameStorageKey = 'username';

  private http = inject(HttpClient);
  private router = inject(Router);

  token = signal<string | null>(sessionStorage.getItem(this.tokenStorageKey));
  username = signal<string | null>(sessionStorage.getItem(this.usernameStorageKey));
  isAuthenticated = signal<boolean>(false);

  constructor() {
    this.restoreSession();
  }

  login(username: string, password: string): Observable<LoginResponse> {
    const payload: LoginRequest = { username, password };

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, payload).pipe(
      tap((response) => {
        this.saveSession(response.token, username);
      }),
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  private restoreSession(): void {
    const token = sessionStorage.getItem(this.tokenStorageKey);
    const username = sessionStorage.getItem(this.usernameStorageKey);

    if (token && this.isTokenValid(token)) {
      this.token.set(token);
      this.username.set(username);
      this.isAuthenticated.set(true);
      return;
    }

    this.clearSession();
  }

  private saveSession(token: string, username: string): void {
    sessionStorage.setItem(this.tokenStorageKey, token);
    sessionStorage.setItem(this.usernameStorageKey, username);

    this.token.set(token);
    this.username.set(username);
    this.isAuthenticated.set(true);
  }

  private clearSession(): void {
    sessionStorage.removeItem(this.tokenStorageKey);
    sessionStorage.removeItem(this.usernameStorageKey);

    this.token.set(null);
    this.username.set(null);
    this.isAuthenticated.set(false);
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return false;
      }

      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = JSON.parse(atob(normalizedPayload));
      const expiration = jsonPayload.exp;

      if (typeof expiration !== 'number') {
        return true;
      }

      return Date.now() < expiration * 1000;
    } catch {
      return false;
    }
  }
}

export const authGuard = () => {
  const authService = inject(AuthService);
  const router: Router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }
  return router.parseUrl('/login');
};
