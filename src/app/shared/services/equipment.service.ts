import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Equipment } from '../interfaces/equipment.interface';

@Injectable({
  providedIn: 'root',
})
export class EquipmentService {
  private equipments: Equipment[] = [
    {
      id: 1,
      code: 'EQ-001',
      type: 'Silla de ruedas',
      description: 'Silla de ruedas estándar',
      state: 'DISPONIBLE',
      loanDate: '2024-01-01',
      returnDate: '2024-01-02',
    },
    {
      id: 2,
      code: 'EQ-002',
      type: 'Muletas',
      description: 'Muletas de aluminio',
      state: 'PRESTADO',
      loanDate: '2024-01-01',
      returnDate: '2024-01-02',
    },
    {
      id: 3,
      code: 'EQ-003',
      type: 'Andador',
      description: 'Andador con ruedas',
      state: 'REPARACION',
      loanDate: '2024-01-01',
      returnDate: '2024-01-02',
    },
  ];

  getAll(): Observable<Equipment[]> {
    return of(this.equipments);
  }

  getById(id: number): Observable<Equipment | undefined> {
    return of(this.equipments.find((e) => e.id === id));
  }

  updateState(id: number, state: Equipment['state']): void {
    const eq = this.equipments.find((e) => e.id === id);
    if (eq) eq.state = state;
  }
}
