import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  message = signal<string | null>(null);

  show(msg: string) {
    this.message.set(msg);
  }

  dismiss() {
    this.message.set(null);
  }
}
