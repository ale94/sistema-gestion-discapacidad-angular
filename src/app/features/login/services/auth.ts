import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private router: Router = inject(Router);
  isAuthenticated = signal<boolean>(sessionStorage.getItem('is_authenticated') === 'true');

  login(username: string, password: string): boolean {
    // Dummy authentication logic
    if (username === 'admin' && password === 'admin') {
      sessionStorage.setItem('is_authenticated', 'true');
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
  const authService = inject(Auth);
  // FIX: Explicitly type `router` to resolve `Property 'parseUrl' does not exist on type 'unknown'`.
  const router: Router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/login');
};
