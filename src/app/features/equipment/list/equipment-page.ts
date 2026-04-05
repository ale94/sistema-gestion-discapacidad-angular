import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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
      this.loanEquipmentService.deleteLoan(this.loanEquipmentToDelete()!.id).subscribe();
      this.cancelDelete();
    }
  }

  cancelDelete(): void {
    this.loanEquipmentToDelete.set(null);
  }

  handleSave(loanEquipmentData: LoanEquipment) {
    if ('id' in loanEquipmentData) {
      this.loanEquipmentService.updateLoan(loanEquipmentData).subscribe();
    } else {
      this.loanEquipmentService.addLoan(loanEquipmentData).subscribe();
    }
    this.closeModal();
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

      // Creamos un objeto Date "limpio" (solo año, mes, día)
      const year = today.getFullYear();
      const month = today.getMonth();
      const day = today.getDate();

      // Esto crea un objeto Date real en la medianoche local
      const dateObject = new Date(year, month, day);

      const updatedData: LoanEquipment = {
        ...loan,
        returnDate: dateObject // Ahora sí es tipo Date
      };

      this.loanEquipmentService.updateLoan(updatedData).subscribe();
      this.loanToReturn.set(null);
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

      this.loanEquipmentService.updateLoan(updatedData).subscribe();
      this.loanToUndo.set(null);
    }
  }
}
