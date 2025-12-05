import { Component, output } from '@angular/core';

@Component({
  selector: 'app-head',
  standalone: true,
  imports: [],
  templateUrl: './head.html',
})
export class Head {
  toggleMobileSidebar = output<void>();
}
