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
  loanToUndo = signal<LoanEquipment | null>(null);
  searchTerm = signal('');

  filteredLoan = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();

    return this.loanEquipmentService.loans().filter((loan) => {
      const matchesText =
        !term ||
        loan.applicant.toLowerCase().includes(term) ||
        loan.type.toLowerCase().includes(term) ||
        loan.dni.toString().includes(term);
      return matchesText;
    });
  });

  onSearchChange(term: string) {
    this.searchTerm.set(term);
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
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const day = today.getDate();
      const dateObject = new Date(year, month, day);

      const updatedData: LoanEquipment = {
        ...loan,
        returnDate: dateObject
      };

      this.loanEquipmentService.updateLoan(updatedData).subscribe({
        next: () => this.loanToReturn.set(null),
        error: () => alert('Error al registrar la devolución. Intente nuevamente.')
      });
    }
  }

  undoReturn(loan: LoanEquipment) {
    this.loanToUndo.set(loan);
  }

  confirmUndoAction() {
    const loan = this.loanToUndo();
    if (loan) {
      const updatedData: LoanEquipment = {
        ...loan,
        returnDate: undefined
      };

      this.loanEquipmentService.updateLoan(updatedData).subscribe({
        next: () => this.loanToUndo.set(null),
        error: () => alert('Error al deshacer la devolución. Intente nuevamente.')
      });
    }
  }
}
