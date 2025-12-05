import { Component, signal } from '@angular/core';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { Head } from '../../../../shared/components/head/head';

@Component({
  selector: 'main-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Head],
  templateUrl: './main-layout.html',
})
export default class MainLayout {

  isMobileSidebarOpen = signal(false);

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update(v => !v);
  }
}
