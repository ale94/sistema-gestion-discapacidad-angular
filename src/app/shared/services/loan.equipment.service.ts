import { Injectable } from '@angular/core';
import { LoanEquipment } from '../interfaces/loan.equipment.interface';
import { EquipmentService } from './equipment.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoanEquipmentService {
  private loans: LoanEquipment[] = [
    {
      id: 1,
      personId: 101,
      equipmentId: 2,
      deliveryDate: '2026-01-01',
      state: 'ACTIVO',
      observations: 'Entrega domiciliaria',
    },
  ];

  constructor(private equipmentService: EquipmentService) {}

  getActivos(): Observable<LoanEquipment[]> {
    return of(this.loans.filter((p) => p.state === 'ACTIVO'));
  }

  prestar(data: Partial<LoanEquipment>): Observable<LoanEquipment> {
    const nuevo: LoanEquipment = {
      id: this.loans.length + 1,
      personId: data.personId!,
      equipmentId: data.equipmentId!,
      deliveryDate: new Date().toISOString().split('T')[0],
      state: 'ACTIVO',
      observations: data.observations,
    };

    this.loans.push(nuevo);
    this.equipmentService.updateState(data.equipmentId!, 'PRESTADO');

    return of(nuevo);
  }

  devolver(id: number): Observable<void> {
    const loan = this.loans.find((p) => p.id === id);
    if (loan) {
      loan.state = 'DEVUELTO';
      loan.deliveryDate = new Date().toISOString().split('T')[0];
      this.equipmentService.updateState(loan.equipmentId, 'DISPONIBLE');
    }
    return of();
  }
}
