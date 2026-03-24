import { DecimalPipe, NgClass, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Person } from '../../../shared/interfaces/person';
import { PersonService } from '../../../shared/services/person.service';
import { PersonForm } from '../form/person-form';

@Component({
  selector: 'person-list',
  standalone: true,
  imports: [FormsModule, PersonForm, DecimalPipe, NgClass, TitleCasePipe],
  templateUrl: './person-list.html',
})
export default class PersonList {

  personService = inject(PersonService);
  private router = inject(Router);

  isModalOpen = signal(false);
  editingPerson = signal<Person | null>(null);
  personToDelete = signal<Person | null>(null);
  activeFilter = signal<'ALL' | 'CUD' | 'PENSION' | 'PASE_LIBRE'>('ALL');

  searchTerm = signal('');

  filteredPeople = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const filter = this.activeFilter();

    const filtersMap: Record<string, (p: Person) => boolean> = {
      ALL: (p) => true,

      CUD: (p) => p.health?.activeCud ?? false,

      PENSION: (p) => p.benefit?.pension ?? false,

      PASE_LIBRE: (p) => p.benefit?.freePass ?? false,
    };

    return this.personService.persons().filter((person) => {
      // Búsqueda por texto
      const matchesText =
        !term ||
        person.firstName.toLowerCase().includes(term) ||
        person.lastName.toLowerCase().includes(term) ||
        person.dni.includes(term);

      // Filtro por estado
      const matchesFilter = (filtersMap[filter] ?? (() => true))(person);

      return matchesText && matchesFilter;
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
      this.personService.deletePerson(this.personToDelete()!.id).subscribe();
      this.cancelDelete();
    }
  }

  cancelDelete(): void {
    this.personToDelete.set(null);
  }

  handleSave(personData: Person) {
    if ('id' in personData) {
      this.personService.updatePerson(personData).subscribe();
    } else {
      this.personService.addPerson(personData).subscribe();
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
