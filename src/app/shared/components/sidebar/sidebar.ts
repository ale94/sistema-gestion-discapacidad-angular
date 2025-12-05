import { Component, inject, output } from '@angular/core';

import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar {

  authService = inject(AuthService);
  linkClicked = output<void>();

  LinkClicked(): void {
    // Only emit on mobile to close the sidebar
    if (window.innerWidth < 1024) {
      this.linkClicked.emit();
    }
  }

  logout(): void {
    this.authService.logout();
    this.LinkClicked(); // Also close sidebar on logout
  }
}
