import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndicatorForm } from '../form/indicator-form';
import { PersonTracking } from '../../../shared/interfaces/person-tracking';
import { PersonTrackingService } from '../../../shared/services/person-tracking.service';

@Component({
  selector: 'person-indicator',
  imports: [FormsModule, DecimalPipe, IndicatorForm, TitleCasePipe],
  templateUrl: './person-indicator.html',
})
export default class PersonIndicator {
  private personService = inject(PersonTrackingService);

  isModalOpen = signal(false);
  editingPerson = signal<PersonTracking | null>(null);
  personToDelete = signal<PersonTracking | null>(null);

  searchTerm = signal('');

  filteredPeopleIndicators = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const people = this.personService.personsTracking();

    if (!term) return people;

    return people.filter(({ firstName, dni }) =>
      firstName.toLowerCase().includes(term) || dni.includes(term)
    );
  });

  onSearchChange(term: string) {
    this.searchTerm.set(term);
  }

  openAddModal() {
    this.editingPerson.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(person: PersonTracking) {
    this.editingPerson.set(person);
    this.isModalOpen.set(true);
  }

  requestDelete(person: PersonTracking): void {
    this.personToDelete.set(person);
  }

  confirmDeleteAction(): void {
    if (this.personToDelete()) {
      this.personService.deletePerson(this.personToDelete()!.id);
      this.cancelDelete();
    }
  }

  cancelDelete(): void {
    this.personToDelete.set(null);
  }

  handleSave(personData: PersonTracking) {
    if ('id' in personData) {
      this.personService.updatePerson(personData);
    } else {
      this.personService.addPerson(personData);
    }
    this.closeModal();
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingPerson.set(null);
  }
}
