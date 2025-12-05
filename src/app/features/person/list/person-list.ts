import { Component, computed, inject, signal } from '@angular/core';
import { PersonService } from '../../../shared/services/person.service';
import { Router } from '@angular/router';
import { Person } from '../../../shared/interfaces/person.interface';
import { FormsModule } from '@angular/forms';
import { PersonForm } from "../form/person-form";

@Component({
  selector: 'person-list',
  standalone: true,
  imports: [FormsModule, PersonForm],
  templateUrl: './person-list.html',
})
export default class PersonList {
  private personService = inject(PersonService);
  private router = inject(Router);

  people = this.personService.getPeople();
  isModalOpen = signal(false);
  editingPerson = signal<Person | null>(null);
  personToDelete = signal<Person | null>(null);

  searchTerm = signal('');

  filteredPeople = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.people();
    }
    return this.people().filter(
      (person) =>
        person.nombreCompleto.toLowerCase().includes(term) ||
        person.dni.includes(term) ||
        person.diagnostico.toLowerCase().includes(term)
    );
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

  handleSave(personData: Omit<Person, 'id'> | Person) {
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

  viewProfile(person: Person): void {
    this.router.navigate(['/personas', person.id]);
  }

  getAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
}
