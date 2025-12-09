import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Event } from '../../../shared/interfaces/event.interface';

@Component({
  selector: 'event-form',
  imports: [ReactiveFormsModule],
  templateUrl: './event-form.html',
  styleUrl: './event-form.css',
})
export class EventForm {
  event = input<Event | null>(null);
  save = output<Omit<Event, 'id'> | Event>();
  cancel = output<void>();

  private fb = inject(FormBuilder);
  eventForm!: FormGroup;

  isEditMode = false;
  eventTypes: Event['type'][] = ['Taller', 'Capacitación', 'Charla', 'Evento Social', 'Otro'];

  ngOnInit(): void {
    const currentEvent = this.event();
    this.isEditMode = !!currentEvent;

    this.eventForm = this.fb.group({
      name: [currentEvent?.name || '', Validators.required],
      type: [currentEvent?.type || 'Taller', Validators.required],
      date: [currentEvent?.date || '', Validators.required],
      attendees: [currentEvent?.attendees || 0, [Validators.required, Validators.min(0)]],
      description: [currentEvent?.description || '', Validators.required],
    });
  }

  onSubmit() {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;
      if (this.isEditMode && this.event()) {
        this.save.emit({ ...this.event(), ...formValue });
      } else {
        this.save.emit(formValue);
      }
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
