import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Form } from '../form/form';
import { LoanEquipment } from '../../../shared/interfaces/loan.equipment.interface';
import { LoanEquipmentService } from '../../../shared/services/loan.equipment.service';

@Component({
  selector: 'equipment-page',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, Form],
  templateUrl: './equipment-page.html',
})
export default class EquipmentPage {

  loanEquipmentService = inject(LoanEquipmentService);
  isModalOpen = signal(false);
  editingLoanEquipment = signal<LoanEquipment | null>(null);
  loanEquipmentToDelete = signal<LoanEquipment | null>(null);
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
      this.loanEquipmentService.deleteLoan(this.loanEquipmentToDelete()!.id);
      this.cancelDelete();
    }
  }

  cancelDelete(): void {
    this.loanEquipmentToDelete.set(null);
  }

  handleSave(loanEquipmentData: LoanEquipment) {
    if ('id' in loanEquipmentData) {
      this.loanEquipmentService.updateLoan(loanEquipmentData);
    } else {
      this.loanEquipmentService.addLoan(loanEquipmentData);
    }
    this.closeModal();
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingLoanEquipment.set(null);
  }

  // viewProfile(person: Equipment): void {
  //   this.router.navigate(['/personas', person.id]);
  // }

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
