import { effect, inject, Injectable, signal } from '@angular/core';
import { Event } from '../interfaces/event.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EventService {

  private http = inject(HttpClient);
  private url = "http://localhost:8080";
  events = signal<Event[]>(this.loadFromStorage<Event[]>('appEvents', []));

  constructor() {
    effect(() => this.saveToStorage('appEvents', this.events()));
    this.loadEvents();
  }

  loadEvents() {
    this.http.get<Event[]>(`${this.url}/events`)
      .subscribe(data => {
        this.events.set(data);
      });
  }

  addEvent(event: Event) {
    this.http.post<Event>(`${this.url}/events`, event)
      .subscribe((newEvent) => {
        this.events.update((events) => [...events, newEvent]);
      });
  }

  updateEvent(updatedEvent: Event) {
    this.http.put<Event>(`${this.url}/events/${updatedEvent.id}`, updatedEvent)
      .subscribe((updatedEvent) => {
        this.events.update((events) =>
          events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
        );
      });
  }

  deleteEvent(id: string) {
    this.http.delete(`${this.url}/events/${id}`)
      .subscribe(() => {
        this.events.update((events) => events.filter((e) => e.id !== id));
      });
  }

  private loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.error('Error loading from localStorage', e);
      return defaultValue;
    }
  }

  private saveToStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }
}
