import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router: Router = inject(Router);
  private url = 'http://localhost:8080';

  token = signal<string | null>(sessionStorage.getItem('jwt_token'));
  isAuthenticated = signal<boolean>(!!this.token());
  username = signal<string | null>(sessionStorage.getItem('username'));

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<{ token: string }>(`${this.url}/auth/login`, { username, password }).pipe(
      tap((res) => {
        sessionStorage.setItem('jwt_token', res.token);
        sessionStorage.setItem('username', username);
        this.token.set(res.token);
        this.username.set(username);
        this.isAuthenticated.set(true);
      }),
      map(() => true),
      catchError(() => {
        return of(false);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('username');
    this.token.set(null);
    this.username.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
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
