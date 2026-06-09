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
  isLoading = signal(false);

  login(): void {
    if (this.isLoading()) {
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.authService.login(this.username(), this.password()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Usuario o contraseña inválidos.');
      },
    });
  }
}
