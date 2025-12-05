import { Component, inject, output } from '@angular/core';

import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styles: [
    `
      .nav-link.active {
        background-color: #14b8a6;
        color: white;
        font-weight: 600;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease-in-out;
      }
      .nav-link.active svg {
        stroke: white;
      }
    `,
  ],
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
