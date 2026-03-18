import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Equipment } from '../../shared/interfaces/equipment';

@Component({
  selector: 'equipment-page',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './equipment-page.html',
})
export default class EquipmentPage {
  private fb = inject(FormBuilder);

  equipments = signal<Equipment[]>([
    {
      code: 'EQ-001',
      description: 'Silla de ruedas',
      totalStock: 10,
      totalAvailable: 7,
      status: 'DISPONIBLE',
    },
    {
      code: 'EQ-002',
      description: 'Muletas',
      totalStock: 15,
      totalAvailable: 10,
      status: 'DISPONIBLE',
    },
  ]);

  editingCode: string | null = null;

  form = this.fb.group({
    description: ['', Validators.required],
    totalStock: [0, Validators.required],
  });

  // CREAR
  createEquipment() {
    if (this.form.invalid) return;

    const value = this.form.value;

    const newEquipment: Equipment = {
      code: 'EQ-' + (this.equipments().length + 1).toString().padStart(3, '0'),
      description: value.description!,
      totalStock: value.totalStock!,
      totalAvailable: value.totalStock!,
      status: 'DISPONIBLE',
    };

    this.equipments.update((list) => [...list, newEquipment]);

    this.form.reset();
  }

  // EDITAR
  editEquipment(e: Equipment) {
    this.editingCode = e.code;

    this.form.patchValue({
      description: e.description,
      totalStock: e.totalStock,
    });
  }

  // ACTUALIZAR
  updateEquipment() {
    if (!this.editingCode) return;

    const value = this.form.value;

    this.equipments.update((list) =>
      list.map((e) => {
        if (e.code === this.editingCode) {
          const borrowed = e.totalStock - e.totalAvailable;
          const newAvailable = value.totalStock! - borrowed;

          return {
            ...e,
            description: value.description!,
            totalStock: value.totalStock!,
            totalAvailable: newAvailable,
            status: newAvailable > 0 ? 'DISPONIBLE' : 'PRESTADO',
          };
        }

        return e;
      }),
    );

    this.cancelEdit();
  }

  // BORRAR
  deleteEquipment(code: string) {
    this.equipments.update((list) => list.filter((e) => e.code !== code));
  }

  cancelEdit() {
    this.editingCode = null;
    this.form.reset();
  }

  searchTerm() {}

  onSearchChange(value: string) {}

  openAddModal() {}
}
