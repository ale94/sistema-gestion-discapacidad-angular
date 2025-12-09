import { Component, computed, inject, signal } from '@angular/core';
import { EventService } from '../../../shared/services/event.service';
import { GroupedEvent } from '../../../shared/interfaces/grouped.event.interface';
import { EventForm } from '../form/event-form';
import { Event } from '../../../shared/interfaces/event.interface';


@Component({
  selector: 'list',
  standalone: true,
  imports: [EventForm],
  templateUrl: './list.html',
})
export default class List {
  private eventService = inject(EventService);

  isModalOpen = signal(false);
  editingEvent = signal<Event | null>(null);
  eventToDelete = signal<Event | null>(null);
  selectedYear = signal(new Date().getFullYear());

  private allEvents = this.eventService.getEvents();

  monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  eventsByMonth = computed<GroupedEvent[]>(() => {
    const year = this.selectedYear();
    const filteredEvents = this.allEvents().filter(
      (event) => new Date(event.date).getFullYear() === year
    );

    const grouped = filteredEvents.reduce((acc, event) => {
      const monthIndex = new Date(event.date).getMonth();
      if (!acc[monthIndex]) {
        acc[monthIndex] = {
          month: this.monthNames[monthIndex],
          monthIndex: monthIndex,
          events: [],
        };
      }
      acc[monthIndex].events.push(event);
      return acc;
    }, {} as { [key: number]: GroupedEvent });
    return Object.values(grouped).sort(
      (a: GroupedEvent, b: GroupedEvent) => a.monthIndex - b.monthIndex
    );
  });

  changeYear(delta: number): void {
    this.selectedYear.update((year) => year + delta);
  }

  openAddModal() {
    this.editingEvent.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(event: Event) {
    this.editingEvent.set(event);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingEvent.set(null);
  }

  handleSave(eventData: Omit<Event, 'id'> | Event) {
    if ('id' in eventData) {
      this.eventService.updateEvent(eventData);
    } else {
      this.eventService.addEvent(eventData);
    }
    this.closeModal();
  }

  requestDelete(event: Event): void {
    this.eventToDelete.set(event);
  }

  confirmDeleteAction(): void {
    if (this.eventToDelete()) {
      this.eventService.deleteEvent(this.eventToDelete()!.id);
      this.cancelDelete();
    }
  }

  cancelDelete(): void {
    this.eventToDelete.set(null);
  }
}
