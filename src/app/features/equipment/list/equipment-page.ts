import { Component, inject } from '@angular/core';
import { Equipment } from '../../../shared/interfaces/equipment';
import { EquipmentService } from '../../../shared/services/equipment.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormType } from '../form-type/form-type';

@Component({
  selector: 'equipment-page',
  imports: [FormsModule, CommonModule],
  templateUrl: './equipment-page.html',
})
export default class EquipmentPage {

  equipmentsService = inject(EquipmentService)

  equipments: Equipment[] = [];
  filterState = 'TODOS';
  isModalOpen: boolean = false;
  isTypeModalOpen: boolean = false;

  // get filtered(): Equipment[] {
  //   if (this.filterState === 'TODOS') return this.equipments;
  //   return this.equipments.filter((e) => e.state === this.filterState);
  // }

  // Abrir modal de nuevo equipo
  openModal(): void {
    this.isModalOpen = true;
  }

  // Cerrar modal de nuevo equipo
  closeModal(): void {
    this.isModalOpen = false;
  }

  // Abrir modal de tipo de equipo
  openTypeModal(): void {
    this.isTypeModalOpen = true;
  }

  // Cerrar modal de tipo de equipo
  closeTypeModal(): void {
    this.isTypeModalOpen = false;
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
