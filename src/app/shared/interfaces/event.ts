export interface Event {
  id: string;
  name: string;
  type: 'Taller' | 'Capacitación' | 'Charla' | 'Evento Social' | 'Otro';
  date: string; // YYYY-MM-DD
  description: string;
  attendees: number;
}
