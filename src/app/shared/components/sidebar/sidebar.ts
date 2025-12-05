import { Component, inject, output } from '@angular/core';
import { Auth } from '../../services/auth';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar {

  authService = inject(Auth);
  linkClicked = output<void>();

  onLinkClicked(): void {
    // Only emit on mobile to close the sidebar
    if (window.innerWidth < 1024) {
      this.linkClicked.emit();
    }
  }

  logout(): void {
    this.authService.logout();
    this.onLinkClicked(); // Also close sidebar on logout
  }
}
