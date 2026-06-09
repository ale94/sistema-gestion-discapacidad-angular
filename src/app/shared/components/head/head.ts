import { Component, inject, output } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-head',
  standalone: true,
  imports: [],
  templateUrl: './head.html',
})
export class Head {
  toggleMobileSidebar = output<void>();
  authService = inject(AuthService);
}
