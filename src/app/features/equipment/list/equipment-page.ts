import { Component } from '@angular/core';
import { Equipment } from '../../../shared/interfaces/equipment.interface';
import { EquipmentService } from '../../../shared/services/equipment.service';
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

  constructor(private service: EquipmentService) {}

  ngOnInit(): void {
    this.service.getAll().subscribe((data) => (this.equipments = data));
  }

  get filtered(): Equipment[] {
    if (this.filterState === 'TODOS') return this.equipments;
    return this.equipments.filter((e) => e.state === this.filterState);
  }
}
