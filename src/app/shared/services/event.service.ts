import { effect, Injectable, signal } from '@angular/core';
import { Event } from '../interfaces/event.interface';

@Injectable({
  providedIn: 'root',
})
export class EventService {

  private events = signal<Event[]>(this.loadFromStorage('appEvents', []));

  constructor() {
    effect(() => this.saveToStorage('appEvents', this.events()));

    // Generate mock data if storage is empty
    if (this.events().length === 0) {
      this.events.set(this.generateMockData());
    }
  }

  getEvents() {
    return this.events.asReadonly();
  }

  addEvent(event: Omit<Event, 'id'>) {
    const newEvent: Event = { ...event, id: crypto.randomUUID() };
    this.events.update((events) => [...events, newEvent]);
  }

  updateEvent(updatedEvent: Event) {
    this.events.update((events) =>
      events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
    );
  }

  deleteEvent(id: string) {
    this.events.update((events) => events.filter((e) => e.id !== id));
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

  private generateMockData(): Event[] {
    const currentYear = new Date().getFullYear();
    return [
      {
        id: crypto.randomUUID(),
        name: 'Taller de Arte Inclusivo',
        type: 'Taller',
        date: `${currentYear}-03-15`,
        description: 'Exploración de técnicas de pintura y escultura adaptadas.',
        attendees: 25,
      },
      {
        id: crypto.randomUUID(),
        name: 'Capacitación sobre Derechos',
        type: 'Capacitación',
        date: `${currentYear}-04-22`,
        description: 'Charla informativa sobre los derechos de las personas con discapacidad.',
        attendees: 40,
      },
      {
        id: crypto.randomUUID(),
        name: 'Encuentro Social de Primavera',
        type: 'Evento Social',
        date: `${currentYear}-09-21`,
        description: 'Jornada recreativa con música y juegos al aire libre.',
        attendees: 60,
      },
      {
        id: crypto.randomUUID(),
        name: 'Charla de Sensibilización',
        type: 'Charla',
        date: `${currentYear}-05-10`,
        description: 'Charla para la comunidad sobre la importancia de la inclusión.',
        attendees: 35,
      },
      {
        id: crypto.randomUUID(),
        name: 'Taller de Jardinería',
        type: 'Taller',
        date: `${currentYear}-04-05`,
        description: 'Actividad práctica para aprender a cuidar plantas y flores.',
        attendees: 18,
      },
      {
        id: crypto.randomUUID(),
        name: 'Taller de Lectura Fácil',
        type: 'Taller',
        date: `${currentYear - 1}-11-18`,
        description: 'Club de lectura con materiales adaptados.',
        attendees: 12,
      },
    ];
  }
}
