import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Auth } from '../../services/auth';

@Component({
  selector: 'login-page',
  imports: [],
  templateUrl: './login-page.html',
})
export default class LoginPage {

  private authService = inject(Auth);
  private router: Router = inject(Router);

  username = signal('');
  password = signal('');
  errorMessage = signal<string | null>(null);

  onLogin(): void {
    this.errorMessage.set(null);
    if (this.authService.login(this.username(), this.password())) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set('Credenciales inválidas. Intente con "admin" y "admin".');
    }
  }
}
