import { Component } from '@angular/core';
import { Equipment } from '../../shared/interfaces/equipment.interface';
import { EquipmentService } from '../../shared/services/equipment.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'equipment-page',
  imports: [FormsModule, CommonModule],
  templateUrl: './equipment-page.html',
})
export default class EquipmentPage {
  equipments: Equipment[] = [];
  filterState = 'TODOS';
  isModalOpen: boolean = false;
  isLoanModalOpen: boolean = false;


  constructor(private service: EquipmentService) { }

  ngOnInit(): void {
    this.service.getAll().subscribe((data) => (this.equipments = data));
  }

  get filtered(): Equipment[] {
    if (this.filterState === 'TODOS') return this.equipments;
    return this.equipments.filter((e) => e.state === this.filterState);
  }

  // Abrir modal de nuevo equipo
  openModal(): void {
    this.isModalOpen = true;
  }

  // Cerrar modal de nuevo equipo
  closeModal(): void {
    this.isModalOpen = false;
  }

  // Abrir modal de préstamo
  openLoanModal(): void {
    this.isLoanModalOpen = true;
  }

  // Cerrar modal de préstamo
  closeLoanModal(): void {
    this.isLoanModalOpen = false;
  }

  deleteEquipment(code: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
      this.equipments = this.equipments.filter(e => e.code !== code);
      console.log('Equipo eliminado:', code);
    }
  }

  openEditModal(equipment: Equipment): void {
    // this.selectedEquipment = equipment;
    // this.equipmentForm = {
    //   code: equipment.code,
    //   type: equipment.type,
    //   state: equipment.state
    // };
    // this.isModalOpen = true;
    console.log('Modal de edición abierto para:', equipment.code);
  }
}
