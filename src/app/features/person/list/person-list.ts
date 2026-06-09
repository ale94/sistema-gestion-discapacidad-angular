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

  constructor() {
    this.personService.loadPersons();
  }

  isModalOpen = signal(false);
  editingPerson = signal<Person | null>(null);
  personToDelete = signal<Person | null>(null);
  activeFilter = signal<'ALL' | 'CUD' | 'PENSION' | 'PASE_LIBRE'>('ALL');

  searchTerm = signal('');
  searchInput = signal('');
  searching = signal(false);
  currentPage = signal(1);
  pageSize = 5;
  maxVisiblePages = 5;
  Math = Math;

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
      const matchesText =
        !term ||
        (person.firstName ?? '').toLowerCase().includes(term) ||
        (person.lastName ?? '').toLowerCase().includes(term) ||
        (person.dni ?? '').toString().includes(term);

      const matchesFilter = (filtersMap[filter] ?? (() => true))(person);

      return matchesText && matchesFilter;
    });
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredPeople().length / this.pageSize)));

  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  currentPageGroup = computed(() => Math.floor((this.currentPage() - 1) / this.maxVisiblePages));

  visiblePages = computed(() => {
    const start = this.currentPageGroup() * this.maxVisiblePages;
    return this.pages().slice(start, start + this.maxVisiblePages);
  });

  paginatedPeople = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredPeople().slice(start, start + this.pageSize);
  });

  onSearchInput(term: string) {
    this.searchInput.set(term);
    if (!term.trim()) {
      this.searchTerm.set('');
      this.currentPage.set(1);
    }
  }

  doSearch() {
    this.searching.set(true);
    setTimeout(() => {
      this.searchTerm.set(this.searchInput());
      this.currentPage.set(1);
      this.searching.set(false);
    }, 2000);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  prevGroup() {
    const firstInGroup = this.currentPageGroup() * this.maxVisiblePages + 1;
    this.goToPage(firstInGroup - 1);
  }

  nextGroup() {
    const firstInNext = (this.currentPageGroup() + 1) * this.maxVisiblePages + 1;
    this.goToPage(firstInNext);
  }

  setFilter(filter: 'ALL' | 'CUD' | 'PENSION' | 'PASE_LIBRE') {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
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
      this.personService.deletePerson(this.personToDelete()!.id).subscribe({
        next: () => this.cancelDelete(),
        error: () => alert('Error al eliminar la persona. Intente nuevamente.')
      });
    }
  }

  cancelDelete(): void {
    this.personToDelete.set(null);
  }

  handleSave(personData: Person) {
    const request$ = 'id' in personData
      ? this.personService.updatePerson(personData)
      : this.personService.addPerson(personData);

    request$.subscribe({
      next: () => this.closeModal(),
      error: (err) => {
        console.error('Error al guardar la persona:', err.message);
        alert('Error al guardar la persona. Intente nuevamente.');
      }
    });
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingPerson.set(null);
  }

  viewProfile(person: Person): void {
    this.router.navigate(['/personas', person.id]);
  }

  getAge(birthDate: Date): number {
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
