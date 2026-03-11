import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndicatorForm } from '../form/indicator-form';
import { Person } from '../../../shared/interfaces/person';
import { PersonService } from '../../../shared/services/person.service';

@Component({
  selector: 'person-indicator',
  imports: [FormsModule, DecimalPipe, IndicatorForm, TitleCasePipe, DatePipe],
  templateUrl: './person-indicator.html',
})
export default class PersonIndicator {
  private personService = inject(PersonService);

  isModalOpen = signal(false);
  editingPerson = signal<Person | null>(null);
  personToDelete = signal<Person | null>(null);

  searchTerm = signal('');

  filteredPeopleIndicators = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const people = this.personService.persons();

    return people.filter((person) => {
      if (person.status !== 'en_seguimiento') return false;

      if (!term) return true;

      return person.firstName.toLowerCase().includes(term) || person.dni.includes(term);
    });
  });

  onSearchChange(term: string) {
    this.searchTerm.set(term);
  }

  openAddModal() {
    this.editingPerson.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(person: Person) {
    this.editingPerson.set(person);
    this.isModalOpen.set(true);
  }

  requestDelete(person: Person): void {
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

  handleSave(personData: Person) {
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
