import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndicatorForm } from '../form/indicator-form';
import { PeopleIndicatorsService } from '../../../shared/services/people.indicators.service';
import { PeopleIndicator } from '../../../shared/interfaces/people.indicator.interface';

@Component({
  selector: 'person-indicator',
  imports: [FormsModule, DecimalPipe, IndicatorForm],
  templateUrl: './person-indicator.html',
})
export default class PersonIndicator {
  private peopleIndicators = inject(PeopleIndicatorsService);
  people = this.peopleIndicators.getPeopleIndicators();
  isModalOpen = signal(false);
  editingPerson = signal<PeopleIndicator | null>(null);
  personToDelete = signal<PeopleIndicator | null>(null);

  searchTerm = signal('');

  filteredPeopleIndicators = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const people = this.people();

    return people.filter((person) => {
      if (!term) return true;

      return person.apellidoNombre.toLowerCase().includes(term) || person.dni.includes(term);
    });
  });

  onSearchChange(term: string) {
    this.searchTerm.set(term);
  }

  openAddModal() {
    this.editingPerson.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(person: PeopleIndicator) {
    this.editingPerson.set(person);
    this.isModalOpen.set(true);
  }

  requestDelete(person: PeopleIndicator): void {
    this.personToDelete.set(person);
  }

  confirmDeleteAction(): void {
    if (this.personToDelete()) {
      this.peopleIndicators.deletePerson(this.personToDelete()!.id);
      this.cancelDelete();
    }
  }

  cancelDelete(): void {
    this.personToDelete.set(null);
  }

  handleSave(personData: Omit<PeopleIndicator, 'id'> | PeopleIndicator) {
    if ('id' in personData) {
      this.peopleIndicators.updatePerson(personData);
    } else {
      this.peopleIndicators.addPerson(personData);
    }
    this.closeModal();
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingPerson.set(null);
  }
}
