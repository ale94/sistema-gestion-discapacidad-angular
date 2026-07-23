import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Form } from '../form/form';
import { LoanEquipment } from '../../../shared/interfaces/loan.equipment.interface';
import { LoanEquipmentService } from '../../../shared/services/loan.equipment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'equipment-page',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, Form],
  templateUrl: './equipment-page.html',
})
export default class EquipmentPage {

  loanEquipmentService = inject(LoanEquipmentService);
  private router = inject(Router);

  isModalOpen = signal(false);
  editingLoanEquipment = signal<LoanEquipment | null>(null);
  loanEquipmentToDelete = signal<LoanEquipment | null>(null);
  loanToReturn = signal<LoanEquipment | null>(null);
  searchTerm = signal('');
  searchInput = signal('');
  searching = signal(false);
  currentPage = signal(1);
  pageSize = 10;
  maxVisiblePages = 5;
  Math = Math;

  filterTipo = signal('');
  filterEstado = signal('');

  tipoOptions = computed(() => {
    const types = new Set(this.loanEquipmentService.loans().map(l => l.type).filter(Boolean));
    return Array.from(types);
  });

  filteredLoan = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const fTipo = this.filterTipo();
    const fEstado = this.filterEstado();

    return this.loanEquipmentService.loans().filter((loan) => {
      const matchesText =
        !term ||
        (loan.applicant ?? '').toLowerCase().includes(term) ||
        (loan.type ?? '').toLowerCase().includes(term) ||
        (loan.dni ?? '').toString().includes(term);

      const matchesTipo = !fTipo || loan.type === fTipo;

      let matchesEstado = true;
      if (fEstado === 'EN_PRESTAMO') matchesEstado = !loan.returnDate;
      else if (fEstado === 'DEVUELTO') matchesEstado = !!loan.returnDate;

      return matchesText && matchesTipo && matchesEstado;
    });
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredLoan().length / this.pageSize)));
  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  currentPageGroup = computed(() => Math.floor((this.currentPage() - 1) / this.maxVisiblePages));
  visiblePages = computed(() => {
    const start = this.currentPageGroup() * this.maxVisiblePages;
    return this.pages().slice(start, start + this.maxVisiblePages);
  });
  paginatedLoan = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredLoan().slice(start, start + this.pageSize);
  });

  onSearchInput(term: string) {
    this.searchInput.set(term);
    if (!term.trim()) {
      this.searchTerm.set('');
      this.currentPage.set(1);
    }
  }

  onFilterChange() {
    this.currentPage.set(1);
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

  openAddModal() {
    this.editingLoanEquipment.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(loanEquipment: LoanEquipment) {
    this.editingLoanEquipment.set(loanEquipment);
    this.isModalOpen.set(true);
  }

  requestDelete(loanEquipment: LoanEquipment): void {
    this.loanEquipmentToDelete.set(loanEquipment);
  }

  confirmDeleteAction(): void {
    if (this.loanEquipmentToDelete()) {
      this.loanEquipmentService.deleteLoan(this.loanEquipmentToDelete()!.id).subscribe({
        next: () => this.cancelDelete(),
        error: () => alert('Error al eliminar el préstamo. Intente nuevamente.')
      });
    }
  }

  cancelDelete(): void {
    this.loanEquipmentToDelete.set(null);
  }

  handleSave(loanEquipmentData: LoanEquipment) {
    const request$ = 'id' in loanEquipmentData
      ? this.loanEquipmentService.updateLoan(loanEquipmentData)
      : this.loanEquipmentService.addLoan(loanEquipmentData);

    request$.subscribe({
      next: () => this.closeModal(),
      error: () => alert('Error al guardar el préstamo. Intente nuevamente.')
    });
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingLoanEquipment.set(null);
  }

  viewProfile(loan: LoanEquipment): void {
    this.router.navigate(['/prestamos', loan.id]);
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

  markAsReturned(loan: LoanEquipment) {
    this.loanToReturn.set(loan);
  }

  cancelReturn() {
    this.loanToReturn.set(null);
  }

  confirmReturnAction() {
    const loan = this.loanToReturn();
    if (loan) {
      const dateStr = new Date().toISOString().split('T')[0];

      const updatedData: LoanEquipment = {
        ...loan,
        returnDate: dateStr
      };

      this.loanEquipmentService.updateLoan(updatedData).subscribe({
        next: () => this.loanToReturn.set(null),
        error: () => alert('Error al registrar la devolución. Intente nuevamente.')
      });
    }
  }

  loanToUndo = signal<LoanEquipment & { newExpiration?: string } | null>(null);

  undoReturn(loan: LoanEquipment) {
    this.loanToUndo.set({ ...loan, newExpiration: '' });
  }

  confirmUndoAction() {
    const loan = this.loanToUndo();
    if (loan) {
      const updatedData: LoanEquipment = {
        ...loan,
        returnDate: undefined,
        expiration: loan.newExpiration || loan.expiration
      };

      this.loanEquipmentService.updateLoan(updatedData).subscribe({
        next: () => this.loanToUndo.set(null),
        error: () => alert('Error al deshacer la devolución. Intente nuevamente.')
      });
    }
  }

  onNewExpirationChange(value: string) {
    this.loanToUndo.update(loan => loan ? { ...loan, newExpiration: value } : null);
  }
}
