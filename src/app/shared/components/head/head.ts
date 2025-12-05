import { Component, computed, inject, output } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-head',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './head.html',
})
export class Head {
  toggleMobileSidebar = output<void>();
  authService = inject(AuthService);
  username = computed(() => this.authService.username());

}
