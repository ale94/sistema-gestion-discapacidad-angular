import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

function simpleHash(text: string): string {
  return btoa(text).substring(0, 15);
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  HASHED_USERS = [
    { username: 'eugenia', position: 'directora', passwordHash: simpleHash('admin') },
    { username: 'maria', position: 'administrativa', passwordHash: simpleHash('1234') },
  ];
  isAuthenticated = signal<boolean>(sessionStorage.getItem('is_authenticated') === 'true');
  username = signal<string | null>(sessionStorage.getItem('username'));
  private router: Router = inject(Router);

  login(username: string, password: string): boolean {
    const user = this.HASHED_USERS.find((u) => u.username === username);
    const passwordHash = simpleHash(password);

    if (user && user.passwordHash === passwordHash) {
      sessionStorage.setItem('is_authenticated', 'true');
      sessionStorage.setItem('username', username);

      this.username.set(username);
      this.isAuthenticated.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    sessionStorage.removeItem('is_authenticated');
    sessionStorage.removeItem('username');

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
