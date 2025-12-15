import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';


@Component({
  selector: 'login-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login-page.html',
})
export default class LoginPage {

  private authService = inject(AuthService);
  private router: Router = inject(Router);

  username = signal('');
  password = signal('');
  errorMessage = signal<string | null>(null);

  login(): void {
    this.errorMessage.set(null);
    if (this.authService.login(this.username(), this.password())) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set('Credenciales inválidas. Intente nuevamente.');
    }
  }
}
