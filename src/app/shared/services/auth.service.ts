import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private router: Router = inject(Router);
  isAuthenticated = signal<boolean>(sessionStorage.getItem('is_authenticated') === 'true');
  username = signal<string | null>(null);

  login(username: string, password: string): boolean {
    if (username === 'admin' && password === 'admin') {
      sessionStorage.setItem('is_authenticated', 'true');
      this.username.set(username);
      this.isAuthenticated.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    sessionStorage.removeItem('is_authenticated');
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
