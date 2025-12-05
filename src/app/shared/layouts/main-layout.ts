import { Component, signal } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../components/sidebar/sidebar';
import { Head } from '../components/head/head';


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
